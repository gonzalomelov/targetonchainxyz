import time
import pandas as pd
import ollama
import pymysql
from dotenv import load_dotenv
from db_config import get_mysql_connection
from country_codes import country_code_to_name
from data_processing import clean_text

def generate_catchy_message(profile_text, product_title, product_combined_text):
    # print("####")
    # print(profile_text)
    # print(product_title)
    # print(product_combined_text)
    response = ollama.chat(
        model='llama3.1:8b',
        messages=[
            {
                "role": "user",
                "content": f"""
                  You are a professional Community Manager.
                  You need to suggest a catchy message for a user profile: '{profile_text}' recommending the product: '{product_title}' with the following details: {product_combined_text}.
                  
                  Examples:
                  1. Hey there valued Coinbase One 🔵 member! We appreciate your loyalty and commitment to securing your financial future. Our Whey Protein (Chocolate Flavour) is perfect for you. Grab Yours Now! 💪🍫
                  - If the user has a Coinbase One account, mention it positively without inventing information.
                  - If the user has a Coinbase 🔵 account, do the same as with Coinbase One 🔵 account.
                  - If the user has both, mention that the user is a Coinbase fan positively without inventing information.
                  2. Hey champ! 🇺🇸🏃‍♂️💨 As a dedicated runner from the USA, our Whey Protein (Chocolate Flavour) is perfect for your muscle recovery and strength building. Grab Yours Now! 💪🍫
                  - If a country is shown, include something short about it. If not, then do nothing about it.
                  - If the user runs, short about it.

                  Important:
                  - Less than 350 characters.
                  - Do not use the first person.
                  - Do not use quotation marks in the message.
                  - Use emojis if possible.
                  - For the user profile, do not use as is, update it reasonably.
                  
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

def fetch_and_update_group_recommendations(conn_mysql, cur_mysql):
    # Fetch all group recommendations
    cur_mysql.execute("SELECT gr.frameId, gr.profileText, gr.productId, gr.productTitle, gr.message, gr.createdAt, p.description, p.alt FROM GroupRecommendation gr JOIN Product p ON gr.productId = p.id WHERE gr.message IS NULL OR gr.message = ''")
    group_recommendations = cur_mysql.fetchall()

    # Convert fetched results to list of dictionaries
    group_recommendations = [
        {
            "frameId": row[0],
            "profileText": row[1],
            "productId": row[2],
            "productTitle": row[3],
            "message": row[4],
            "createdAt": row[5],
            "productDescription": row[6],
            "productAlt": row[7]
        } 
        for row in group_recommendations
    ]
    
    # Define keywords and phrases for activity categories
    activity_keywords = {
        "running_100": ["for frequent runners", "for daily running", "ideal for daily runners", "run every day"],
        "running_50": ["run multiple times a week", "run several times a week"],
        "running_10": ["run weekly", "for weekly running"],
        "running_5": ["occasional running", "run a few times a month"],
        "running_1": ["run occasionally"],
        "running_0": ["sedentary"]
    }

    # Infer multiple activity categories for products
    def infer_activity_categories(text, keywords):
        matched_categories = []
        for category, phrases in keywords.items():
            if any(phrase in text for phrase in phrases):
                matched_categories.append(category)
        return ' '.join(matched_categories)

    # Generate and update messages for each recommendation
    for recommendation in group_recommendations:
        recommendation['cleaned_description'] = clean_text(str(recommendation['productDescription']))
        combined_text = recommendation['productTitle'] + ' ' + recommendation['cleaned_description'] + ' ' + (recommendation['productAlt'] or '')
        activity_categories = infer_activity_categories(combined_text, activity_keywords)
        recommendation['combined_text'] = combined_text + ' ' + activity_categories
      
        message = generate_catchy_message(transform_string(recommendation["profileText"]), recommendation["productTitle"], recommendation['combined_text'])
        
        upsert_query = """
        INSERT INTO GroupRecommendation (frameId, profileText, productId, productTitle, message, createdAt)
        VALUES (%s, %s, %s, %s, %s, NOW())
        ON DUPLICATE KEY UPDATE
        message = VALUES(message)
        """
        cur_mysql.execute(upsert_query, (recommendation["frameId"], recommendation["profileText"], recommendation["productId"], recommendation["productTitle"], message))
    
    # Commit the transaction
    conn_mysql.commit()
    print(f"Stored {len(group_recommendations)} group recommendations with messages to the database.")

# Load environment variables from .env file
load_dotenv()

# Connect to the MySQL database
conn_mysql, cur_mysql = get_mysql_connection()

# Fetch products and recommend
fetch_and_update_group_recommendations_start_time = time.time()
fetch_and_update_group_recommendations(conn_mysql, cur_mysql)
fetch_and_update_group_recommendations_end_time = time.time()
print(f"Total time to run fetch_and_update_group_recommendations: {fetch_and_update_group_recommendations_end_time - fetch_and_update_group_recommendations_start_time:.2f} seconds")

# Clean up database connections
cur_mysql.close()
conn_mysql.close()
 