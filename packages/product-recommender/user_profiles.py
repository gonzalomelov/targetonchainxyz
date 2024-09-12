import time
import json
from data_processing import extract_country_from_json, categorize_sessions

def fetch_profile_groups(cur_mysql):
    query = """
    SELECT profileText
    FROM GroupProfile
    """
    cur_mysql.execute(query)
    result = cur_mysql.fetchall()
    profile_groups = {row[0]: [] for row in result}  # Assuming profileText is unique
    return profile_groups

def get_all_wallet_attestations(cur_pg, attestations_csv):
    query = """
    SELECT "recipient", "schemaId", COUNT(*) as count, MAX("decodedDataJson") as decodedDataJson
    FROM "Attestation"
    WHERE "schemaId" IN (
        '0x1801901fabd0e6189356b4fb52bb0ab855276d84f7ec140839fbd1f6801ca065',
        '0x0f5b217904f3c65ad40b7af3db62716daddf53bb5db04b1a3ddb730fda0a474b',
        '0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9',
        '0x254bd1b63e0591fefa66818ca054c78627306f253f86be6023725a67ee6bf9f4'
    )
    GROUP BY "recipient", "schemaId";
    """
    cur_pg.execute(query)
    pg_attestations = cur_pg.fetchall()
    
    csv_attestations = attestations_csv[['recipient', 'schema.id', 'decodedDataJson']].values.tolist()
    
    return pg_attestations, csv_attestations

def create_user_profiles(cur_pg, attestations_csv):
    pg_attestations, csv_attestations = get_all_wallet_attestations(cur_pg, attestations_csv)
    profiles = {}

    # Process PostgreSQL attestations
    for recipient, schema_id, count, decoded_data_json in pg_attestations:
        if recipient not in profiles:
            profiles[recipient] = {
                "wallet": recipient,
                "country_code": "",
                "country": "",
                "activities": {"running": 0},
                "attended_events": [],
                "coinbase": False,
                "coinbase_one": False
            }
        
        profile = profiles[recipient]
        if schema_id == '0x1801901fabd0e6189356b4fb52bb0ab855276d84f7ec140839fbd1f6801ca065':
            country_code, country_name = extract_country_from_json(decoded_data_json)
            profile["country_code"] = country_code
            profile["country"] = country_name
        elif schema_id == '0x0f5b217904f3c65ad40b7af3db62716daddf53bb5db04b1a3ddb730fda0a474b':
            profile["activities"]["running"] += count
        elif schema_id == '0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9':
            profile["coinbase"] = True
        elif schema_id == '0x254bd1b63e0591fefa66818ca054c78627306f253f86be6023725a67ee6bf9f4':
            profile["coinbase_one"] = True

    # Process CSV attestations
    for recipient, schema_id, decoded_data_json in csv_attestations:
        if recipient not in profiles:
            profiles[recipient] = {
                "wallet": recipient,
                "country_code": "",
                "country": "",
                "activities": {"running": 0},
                "attended_events": [],
                "coinbase": False,
                "coinbase_one": False
            }
        
        profile = profiles[recipient]
        if schema_id == '0x1801901fabd0e6189356b4fb52bb0ab855276d84f7ec140839fbd1f6801ca065':
            country_code, country_name = extract_country_from_json(decoded_data_json)
            profile["country_code"] = country_code
            profile["country"] = country_name
        elif schema_id == '0x0f5b217904f3c65ad40b7af3db62716daddf53bb5db04b1a3ddb730fda0a474b':
            profile["activities"]["running"] += 1
        elif schema_id == '0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9':
            profile["coinbase"] = True
        elif schema_id == '0x254bd1b63e0591fefa66818ca054c78627306f253f86be6023725a67ee6bf9f4':
            profile["coinbase_one"] = True

    users = list(profiles.values())

    # print("User Profiles:")
    # for user in users:
    #     print(user)

    return users

def store_group_profiles(cur_mysql, conn_mysql, group_profiles):
    if group_profiles:
        for profile in group_profiles:
            upsert_query = """
            INSERT INTO GroupProfile (profileText, message, createdAt)
            VALUES (%s, %s, NOW())
            ON DUPLICATE KEY UPDATE
            profileText = VALUES(profileText),
            message = VALUES(message)
            """
            cur_mysql.execute(upsert_query, (profile, ""))  # Pass profile and empty string as a tuple
        conn_mysql.commit()
        print(f"Stored {len(group_profiles)} group profiles with default messages to the database.")

def store_group_wallets(cur_mysql, conn_mysql, group_wallets):
    if group_wallets:
        upsert_query = """
        INSERT INTO GroupWallet (profileText, walletAddress, createdAt)
        VALUES (%s, %s, NOW())
        ON DUPLICATE KEY UPDATE
        profileText = VALUES(profileText), walletAddress = VALUES(walletAddress)
        """
        cur_mysql.executemany(upsert_query, group_wallets)
        conn_mysql.commit()
        print(f"Stored {len(group_wallets)} group wallets to the database.")

def create_and_store_profile_groups(conn_mysql, cur_mysql, users):
    start_time = time.time()

    # Preprocess user profiles for TF-IDF vectorization (considering multiple activities)
    def preprocess_user_profile(user):
        profile_text = user['country_code'] + ' ' + user['country'] + ' '
        profile_text += ' '.join([categorize_sessions(activity, sessions) for activity, sessions in user['activities'].items() if sessions > 0]) + ' '
        profile_text += ' '.join(user['attended_events']) + ' '
        profile_text += 'coinbaseone' if user['coinbase_one'] else 'nocoinbaseone'
        profile_text += ' coinbase' if user['coinbase'] else ' nocoinbase'
        return profile_text

    # Process users
    user_profiles_with_wallets_start = time.time()
    user_profiles_with_wallets = [(user['wallet'], preprocess_user_profile(user)) for user in users]
    user_profiles_with_wallets_end = time.time()

    print(f"User profiles with wallets processing time: {user_profiles_with_wallets_end - user_profiles_with_wallets_start} seconds")

    # Group user profiles by their text and store them
    profile_groups_start = time.time()
    profile_groups = {}
    group_wallets = []
    for wallet, profile in user_profiles_with_wallets:
        if profile not in profile_groups:
            profile_groups[profile] = []
        profile_groups[profile].append(wallet)
        group_wallets.append((profile, wallet))
    profile_groups_end = time.time()

    print(f"Profile groups processing time: {profile_groups_end - profile_groups_start} seconds")
    print(f"Number of user profile groups: {len(profile_groups)}")

    for profile, wallets in profile_groups.items():
        print(f"Group with profile '{profile}' has {len(wallets)} wallets")

    # Extract only the unique profile texts for TF-IDF vectorization
    unique_profiles_start = time.time()
    unique_profiles = list(profile_groups.keys())
    unique_profiles_end = time.time()

    print(f"Unique profiles extraction time: {unique_profiles_end - unique_profiles_start} seconds")

    # Generate hashed group IDs
    group_profiles_start = time.time()
    group_profiles = [profile for profile in unique_profiles]
    group_profiles_end = time.time()

    print(f"Group profiles processing time: {group_profiles_end - group_profiles_start} seconds")

    # Call the function to store group profiles with default messages
    store_group_profiles_start = time.time()
    store_group_profiles(cur_mysql, conn_mysql, group_profiles)
    store_group_profiles_end = time.time()

    print(f"Storing group profiles with default messages time: {store_group_profiles_end - store_group_profiles_start} seconds")

    if group_wallets:
        store_group_wallets_start = time.time()
        store_group_wallets(cur_mysql, conn_mysql, group_wallets)
        store_group_wallets_end = time.time()

        print(f"Storing group wallets time: {store_group_wallets_end - store_group_wallets_start} seconds")
        print(f"Group wallets stored")

    total_time = time.time() - start_time
    print(f"Total create_and_store_profile_groups execution time: {total_time} seconds")

    return profile_groups
