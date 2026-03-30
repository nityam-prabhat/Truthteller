import requests
import csv

# API Endpoint and Parameters
url = "https://newsapi.org/v2/everything"
params = {
    "q": "Roger Federer",
    "from": "2025-03-01",  # Adjusted the date to be after the allowed range
    "sortBy": "popularity",
    "apiKey": "4ece752b5a9b4c728c205380220e2c0a",
    "language": "en"
}

# Headers to include in the request
headers = {
    "User-Agent": "YourAppName/1.0"
}

# Send GET request
response = requests.get(url, params=params, headers=headers)

# Check if request was successful
if response.status_code == 200:
    data = response.json()
    
    # Extract relevant fields
    articles = data.get("articles", [])
    
    # File path for CSV
    csv_filename = "Temp.csv"

    # Writing to CSV
    with open(csv_filename, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        # Writing header
        writer.writerow(["sentence", "label", "url"])
        
        # Writing news articles
        for article in articles:
            title = article.get("title", "No title")
            description = article.get("description", "No description")
            url = article.get("url", "No URL")
            writer.writerow([title + ". " + description, True, url]) 
    print(f"CSV file '{csv_filename}' has been created successfully.")
else:
    print(f"Error: Unable to fetch data. Status Code {response.status_code}")
    print(f"Error Message: {response.text}")
