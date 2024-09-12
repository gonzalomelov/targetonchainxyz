import time
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from data_processing import clean_text
from user_profiles import fetch_profile_groups

SIMILARITY_THRESHOLD = 0.03 # Adjust this value as needed

def get_all_frames(cur_mysql):
    query = """
    SELECT id, title, shop, matchingCriteria
    FROM Frame
    WHERE TRUE
        AND matchingCriteria = 'ALL'
        -- AND shop = 'quickstart-62fbe4d4.myshopify.com' -- threshold 0.15
        -- AND shop = 'it-is-football-season.myshopify.com' -- threshold 0.25
        AND shop = 'nouns4health.xyz' -- threshold 0.03
        ;
    """
    cur_mysql.execute(query)
    return cur_mysql.fetchall()

def get_all_products(cur_mysql):
    query = """
    SELECT id, title, description, shop, handle, variantId, variantFormattedPrice, alt, image, createdAt
    FROM Product
    WHERE TRUE
        -- AND shop = 'quickstart-62fbe4d4.myshopify.com'
        -- AND shop = 'it-is-football-season.myshopify.com'
        AND shop = 'nouns4health.xyz'
        ;
    """
    cur_mysql.execute(query)
    return cur_mysql.fetchall()

def store_group_recommendations(cur_mysql, conn_mysql, group_recommendations):
    if group_recommendations:
        upsert_query = """
        INSERT INTO GroupRecommendation (frameId, profileText, productId, productTitle, message, createdAt)
        VALUES (%s, %s, %s, %s, %s, NOW())
        ON DUPLICATE KEY UPDATE
        productTitle = VALUES(productTitle), message = VALUES(message)
        """
        print(f"group_recommendations: {group_recommendations}")  # Debugging line
        cur_mysql.executemany(upsert_query, group_recommendations)
        conn_mysql.commit()
        print(f"Stored {len(group_recommendations)} group recommendations to the database.")

def recommend_products(cur_mysql, conn_mysql):
    profile_groups = fetch_profile_groups(cur_mysql)

    # Fetch frames from MySQL database
    frames = get_all_frames(cur_mysql)
    if not frames:
        print("No frames found in the database.")
        return

    frames_df = pd.DataFrame(frames, columns=['id', 'title', 'shop', 'matchingCriteria'])
    print("Frames fetched from database:", frames_df)  # Debugging line

    # Fetch products from MySQL database
    products = get_all_products(cur_mysql)
    if not products:
        print("No products found in the database.")
        return

    products_df = pd.DataFrame(products, columns=['id', 'title', 'description', 'shop', 'handle', 'variantId', 'variantFormattedPrice', 'alt', 'image', 'createdAt'])
    print("Products fetched from database:", products_df)  # Debugging line

    # Preprocess products
    products_df['description'] = products_df['description'].astype(str)
    products_df['cleaned_description'] = products_df['description'].apply(clean_text)
    products_df['combined_text'] = products_df['title'] + ' ' + products_df['cleaned_description'] + ' ' + products_df['alt'].fillna('')

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

    # Preprocess products
    products_df['description'] = products_df['description'].astype(str)
    products_df['cleaned_description'] = products_df['description'].apply(clean_text)
    products_df['combined_text'] = products_df['title'] + ' ' + products_df['cleaned_description'] + ' ' + products_df['alt'].fillna('')
    products_df['activity_categories'] = products_df['combined_text'].apply(lambda x: infer_activity_categories(x, activity_keywords))
    products_df['combined_text'] = products_df['combined_text'] + ' ' + products_df['activity_categories']

    # Extract only the unique profile texts for TF-IDF vectorization
    unique_profiles = list(profile_groups.keys())

    # Generate hashed group IDs
    group_profiles = [profile for profile in unique_profiles]

    # Combine product descriptions and user profiles for TF-IDF vectorization
    combined_corpus = list(products_df['combined_text']) + unique_profiles

    # Check the combined corpus
    print("Combined Corpus:", combined_corpus)

    # TF-IDF vectorization
    tfidf_vectorization_start = time.time()
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(combined_corpus)
    print(f"Time for TF-IDF vectorization: {time.time() - tfidf_vectorization_start:.2f} seconds")

    # Split TF-IDF matrix into products and user profiles
    product_tfidf = tfidf_matrix[:len(products_df)]
    user_tfidf = tfidf_matrix[len(products_df):]

    # Check the shape of the product TF-IDF matrix
    print(f"Shape of product TF-IDF matrix:", product_tfidf.shape)

    # Check the shape of the user TF-IDF matrix
    print(f"Shape of user TF-IDF matrix:", user_tfidf.shape)

    # Compute cosine similarity between unique user profiles and product descriptions
    similarities = cosine_similarity(user_tfidf, product_tfidf)

    # # Debug: Check similarity scores
    # print(f"Similarity Scores:")
    # np.set_printoptions(threshold=np.inf)
    # print(similarities)
    # np.set_printoptions()

    # Set a threshold for similarity and recommend products
    similarity_threshold = SIMILARITY_THRESHOLD

    group_recommendations = []

    # Start timing the recommendation processing
    recommendation_processing_start = time.time()

    for _, frame in frames_df.iterrows():
        frame_id = frame['id']
        frame_shop = frame['shop']

        # Debug: Print frame
        print(f"Frame:")
        print(frame_shop)

        # Filter products by the frame's shop
        frame_products = products_df[products_df['shop'] == frame_shop].copy()

        # Clean 'description' column for frame-specific products
        frame_products['cleaned_description'] = frame_products['description'].astype(str).apply(clean_text)

        # Combine relevant text columns for TF-IDF vectorization
        frame_products['combined_text'] = frame_products['title'] + ' ' + frame_products['cleaned_description'] + ' ' + frame_products['alt'].fillna('')
        frame_products['activity_categories'] = frame_products['combined_text'].apply(lambda x: infer_activity_categories(x, activity_keywords))
        frame_products['combined_text'] = frame_products['combined_text'] + ' ' + frame_products['activity_categories']

        # Debug: Print frame products
        print(f"Frame products:")
        print(frame_products)

        # TF-IDF vectorization for frame-specific products
        frame_product_tfidf = vectorizer.transform(frame_products['combined_text'].values.astype('U'))

        # Compute cosine similarity between unique user profiles and frame-specific product descriptions
        frame_similarities = cosine_similarity(user_tfidf, frame_product_tfidf)

        for i, profile in enumerate(unique_profiles):
            user_similarities = frame_similarities[i]
            sorted_indices = np.argsort(user_similarities)[::-1]

            recommendations = []
            matching_texts = []
            for idx in sorted_indices[:3]:
                similarity_score = user_similarities[idx]
                if similarity_score >= similarity_threshold:
                    product = frame_products.iloc[idx]
                    recommendations.append(product['id'])
                    matching_texts.append(product['combined_text'])
            while len(recommendations) < 3:
                recommendations.append(None)
            profile_text = profile
            if any(recommendations):
                for rec_idx, product_id in enumerate(recommendations):
                    if product_id:
                        product_title = frame_products.loc[frame_products['id'] == product_id, 'title'].values[0]
                        product_combined_text = matching_texts[rec_idx]
                        group_recommendations.append((frame_id, profile_text, product_id, product_title, ""))
                print(f"Recommendations for Profile {profile_text} in Frame {frame_id}:")
                for rec_idx, product_id in enumerate(recommendations):
                    if product_id:
                        product_title = frame_products.loc[frame_products['id'] == product_id, 'title'].values[0]
                        print(f"- Product ID: {product_id}, Product Title: {product_title}")
                        print(f"Message: {matching_texts[rec_idx]}")

    if group_recommendations:
        store_group_recommendations(cur_mysql, conn_mysql, group_recommendations)
        print(f"Group recommendations stored")

    print(f"Total time to process recommendations: {time.time() - recommendation_processing_start:.2f} seconds")

    return products_df