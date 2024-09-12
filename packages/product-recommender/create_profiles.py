import time
import pandas as pd
from dotenv import load_dotenv
from db_config import get_postgres_connection, get_mysql_connection
from user_profiles import create_user_profiles, create_and_store_profile_groups

# Load environment variables from .env file
load_dotenv()

# Connect to the databases
conn_pg, cur_pg = get_postgres_connection()
conn_mysql, cur_mysql = get_mysql_connection()

# Read the CSV data
attestations_csv = pd.read_csv('receipts-attestations.csv')

# Create user profiles
create_user_profiles_start_time = time.time()
users = create_user_profiles(cur_pg, attestations_csv)
create_user_profiles_end_time = time.time()
print(f"Total time to run create_user_profiles: {create_user_profiles_end_time - create_user_profiles_start_time:.2f} seconds")

# Create and store profile groups
create_and_store_profile_groups_start_time = time.time()
profile_groups = create_and_store_profile_groups(conn_mysql, cur_mysql, users)
create_and_store_profile_groups_end_time = time.time()
print(f"Total time to run create_and_store_profile_groups: {create_and_store_profile_groups_end_time - create_and_store_profile_groups_start_time:.2f} seconds")

# Clean up database connections
cur_pg.close()
conn_pg.close()
cur_mysql.close()
conn_mysql.close()
