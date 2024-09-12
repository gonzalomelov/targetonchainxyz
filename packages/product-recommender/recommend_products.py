import time
import pandas as pd
from dotenv import load_dotenv
from db_config import get_mysql_connection
from product_recommendation import recommend_products

# Load environment variables from .env file
load_dotenv()

# Connect to the MySQL database
conn_mysql, cur_mysql = get_mysql_connection()

# Fetch products and recommend
recommend_products_start_time = time.time()
product_data = recommend_products(cur_mysql, conn_mysql)  # Assume profile_groups are fetched inside the function if not passed
recommend_products_end_time = time.time()
print(f"Total time to run recommend_products: {recommend_products_end_time - recommend_products_start_time:.2f} seconds")

# Clean up database connections
cur_mysql.close()
conn_mysql.close()
 