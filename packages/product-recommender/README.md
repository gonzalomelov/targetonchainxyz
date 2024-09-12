
# Product Recommender

## Overview

Product Recommender is a Python-based recommendation system that suggests products to users based on their onchain data. It uses TF-IDF vectorization and cosine similarity to calculate the similarity between user profiles and product descriptions.

## Categories

- Machine Learning
- Recommendation Systems
- Natural Language Processing

## Features

- Load and preprocess product data from a CSV file.
- Clean and combine product text data for analysis.
- Infer activity categories from product descriptions.
- Define user profiles based on their onchain data.
- Compute cosine similarity between user profiles and product descriptions.
- Recommend products to users based on a minimum similarity threshold.

## Requirements

- Python 3.x
- gdown
- pandas
- numpy
- scikit-learn
- psycopg2-binary
- re

## Installation

1. Clone the repository:

```bash
git clone https://github.com/gonzalomelov/product-recommender.git
```

2. Navigate to the project directory:

```bash
cd product-recommender
```

3. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
```

4. Install the required Python packages:

```bash
pip install -r requirements.txt
```

## Usage

1. Download the product data file from Google Drive using `gdown` and load it into a pandas DataFrame.
2. Clean and preprocess the product data.
3. Define user profiles with details from their onchain data.
4. Compute cosine similarity between user profiles and product descriptions.
5. Recommend products based on a specified similarity threshold.

### Example

Here is a sample code snippet demonstrating how to use the Product Recommender:

```python
# Jupyter Notebook: Product Recommendation System

# Importing necessary libraries

# Install gdown if not already installed
!pip install gdown

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

# Step 1: Load and inspect data
import gdown

# Download the product data file from Google Drive
product_file_id = 'your_file_id'  # Replace with your actual file ID
product_url = f'https://drive.google.com/uc?id={product_file_id}'
product_output = 'products_export_1.csv'
gdown.download(product_url, product_output, quiet=False)

# Load the data from CSV
product_df = pd.read_csv('products_export_1.csv')

# Step 2: Prepare data for analysis
# ... (rest of the code from the provided notebook) ...

# Step 6: Recommend products

# Set a threshold for similarity
similarity_threshold = 0.25  # Adjust this value as needed

# Recommend products based on highest similarity
for i, user in enumerate(users):
    print(f"Recommendations for User {i+1}:")
    user_similarities = similarities[i]
    # Sort product indices by similarity score (descending order)
    sorted_indices = np.argsort(user_similarities)[::-1]
    for idx in sorted_indices:
        similarity_score = user_similarities[idx]
        if similarity_score >= similarity_threshold:  # Only recommend if above threshold
            product = product_data.iloc[idx]
            print(f"- {product['Title']} (Similarity Score: {similarity_score:.2f})")
    print()
```

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/gonzalomelov/product-recommender/blob/main/LICENSE) file for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## Contact

For questions or feedback, please contact [gonzalomelov@gmail.com](mailto:gonzalomelov@gmail.com).
