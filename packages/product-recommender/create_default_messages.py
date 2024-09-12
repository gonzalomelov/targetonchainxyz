import time
import pandas as pd
import ollama
import pymysql
from dotenv import load_dotenv
from db_config import get_mysql_connection
from country_codes import country_code_to_name

def generate_catchy_default_message(profile_text):
    # print("####")
    # print(profile_text)
    response = ollama.chat(
        model='llama3.1:8b',
        messages=[
            {
                "role": "user",
                "content": f"""
                  You are a professional Community Manager.
                  You need to suggest a catchy message for a user profile: '{profile_text}' for which we don't have a personalized recommendation but any of our top products could work.

                  Examples:
                  1. "Hey there valued Coinbase One 🔵 member! We appreciate your loyalty and commitment to securing your financial future. While we don't have a specific recommendation right now, check out these picks we have for you! 🔥"
                  - If the user has a Coinbase One account, mention it positively without inventing information or relating it to the recommended products.
                  - If the user has a Coinbase 🔵 account, do the same as with Coinbase One 🔵 account.
                  2. "Greetings! Based in USA 🇺🇸? While we don't have a specific recommendation right now, you'll love one these exclusive products we have for you! 🎉"
                  - If a country is shown, include something short about it.
                  3. "Hey champ! We know you're a such runner 🏃, and while we don't have a specific recommendation right now, we think you'll love one of our iconic products. Grab Yours Now! 💪"
                  - If the user runs, short about it.

                  Important:
                  - Less than 350 characters.
                  - Do not use the first person.
                  - Do not use quotation marks in the message.
                  - Use emojis if possible.
                  - Do not mention or list specific products.
                  
                  Now create a message based on the given user profile. Only output the message.
                """
            }
        ]
    )
    message = response['message']['content'].strip('"')
    print(message)
    return message

def transform_string(s):
    words = s.split()
    result = []
    country = ""

    for word in words:
        if word == "coinbaseone":
            result.append("Has Coinbase One account")
        elif word == "coinbase":
            result.append("Has Coinbase account")
        elif word == "nocoinbaseone" or word == "nocoinbase":
            continue
        elif word.startswith("running_"):
            running_value = int(word.split("_")[1])
            if running_value == 100:
                result.append("Ideal for daily runners")
            elif running_value == 50:
                result.append("Run several times a week")
            elif running_value == 10:
                result.append("For weekly running")
            elif running_value == 5:
                result.append("Run a few times a month")
            elif running_value == 1:
                result.append("Run occasionally")
            elif running_value == 0:
                result.append("Sedentary")
        elif len(word) == 2 and word.isupper() and word in country_code_to_name:
            country = country_code_to_name[word]
        elif len(word) > 2 and word.isalpha() and word not in country_code_to_name:
            country = word

    if country:
        result.insert(0, f"Country of residence: {country}")

    return ". ".join(result) + "."

def fetch_and_update_group_profiles(conn_mysql, cur_mysql):
    # Fetch all group profiles
    cur_mysql.execute("SELECT profileText FROM GroupProfile")
    group_profiles = [row[0] for row in cur_mysql.fetchall()]
    
    # Generate and update messages for each profile
    for profile in group_profiles:
        default_message = generate_catchy_default_message(profile_text=transform_string(profile))
        
        upsert_query = """
        INSERT INTO GroupProfile (profileText, message, createdAt)
        VALUES (%s, %s, NOW())
        ON DUPLICATE KEY UPDATE
        message = VALUES(message)
        """
        cur_mysql.execute(upsert_query, (profile, default_message))
    
    # Commit the transaction
    conn_mysql.commit()
    print(f"Stored {len(group_profiles)} group profiles with default messages to the database.")

# Load environment variables from .env file
load_dotenv()

# Connect to the MySQL database
conn_mysql, cur_mysql = get_mysql_connection()

# Fetch products and recommend
fetch_and_update_group_profiles_start_time = time.time()
fetch_and_update_group_profiles(conn_mysql, cur_mysql)
fetch_and_update_group_profiles_end_time = time.time()
print(f"Total time to run fetch_and_update_group_profiles: {fetch_and_update_group_profiles_end_time - fetch_and_update_group_profiles_start_time:.2f} seconds")

# Clean up database connections
cur_mysql.close()
conn_mysql.close()
 