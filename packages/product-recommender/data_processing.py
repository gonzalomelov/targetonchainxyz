import re
import json
from country_codes import country_code_to_name

def extract_country_from_json(decoded_data_json):
    try:
        data = json.loads(decoded_data_json)
        for item in data:
            if item['name'] == 'verifiedCountry':
                country_code = item['value']['value'].upper()
                country_name = country_code_to_name.get(country_code, country_code)
                return country_code, country_name
    except (json.JSONDecodeError, KeyError, TypeError):
        pass
    return "", ""

def categorize_sessions(activity, sessions):
    if activity == "running":
        if sessions > 100:
            return "running_100"
        elif sessions > 50:
            return "running_50"
        elif sessions > 10:
            return "running_10"
        elif sessions > 5:
            return "running_5"
        elif sessions > 0:
            return "running_1"
        elif sessions == 0:
            return "running_0"
    return activity  # Keep original activity for non-running activities

def clean_text(text):
    if isinstance(text, float):
        text = str(text)
    text = text.replace("Coinbase One", "coinbaseone")
    clean = re.compile('<.*?>')
    text = re.sub(clean, '', text)
    text = re.sub(r'[^\w\s]', '', text).lower()
    return text