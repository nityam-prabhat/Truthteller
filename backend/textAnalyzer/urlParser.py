import requests
import concurrent.futures
import json
import time

# List of Diffbot API keys
diffbot_key = "a9f33c4419e33a0e36a18ce9c4fc92ff"

# OpenAI API credentials
OPENAI_API_KEY = ""

def fetch_article(api_key, url):
    api_url = f"https://api.diffbot.com/v3/article?token={api_key}"
    try:
        response = requests.get(api_url, params={"url": url, "naturalLanguage": "summary", "fields": "text,siteName,title"})
        data = response.json()
        if "objects" in data and len(data["objects"]) > 0:
            return {
                "url": url,
                "title": data["objects"][0].get("title", "No title found"),
                "summary": data["objects"][0].get("naturalLanguage", {}).get("summary", "No summary found")[:500]
                # "language": data["objects"][0].get("humanLanguage", "No language found")
            }
    except requests.exceptions.RequestException as e:
        return {"url": url, "error": str(e)}

def fact_check(query, summary, url):
    """Use OpenAI API for fact-checking."""
    prompt = f"""
    You are a fact-checker.
    Check wheter the followig claim is true or false based on the sources provided below:

    Claim" news-"{query}"

    Sources:
    {summary}

    Respond in the following JSON format:
    {{
    "query": {query},
    "prediction": "True" or "False",
    "justification": "Provided a detailed justification based on the sources provided.",
    "sources": {url},
    "lang": "en"
    }}
    make sources an array of strings with one value {url}
    """

    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        json={"model": "gpt-3.5-turbo", "messages": [{"role": "user", "content": prompt}], "max_tokens": 1000},
        headers={"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"},
    )

    if response.status_code == 200:
        return response.json().get("choices", [{}])[0].get("message", {}).get("content", "No response from OpenAI.")
    else:
        print(f"Error with OpenAI API: {response.status_code}, {response.text}")
        return "Failed to retrieve fact check."
    
def main(url):
    # url ="https://indianexpress.com/section/sports/cricket/live-score/rcb-vs-gt-live-score-full-scorecard-highlights-ipl-2025-match-14-royal-challengers-bengaluru-vs-gujarat-titans-bcahm04022025257228/"
    # Track start time
    print("url got:")
    print(url)
    start_time = time.time()
    # Execute the fetch operations concurrently
    result = fetch_article(diffbot_key, url)
    print("result heading")
    return result["title"]
    # fact_checked = fact_check(result['title'], result['summary'], url)
    # fact_checked = json.loads(fact_checked)
    # print(fact_checked)

    # # Track end time
    # end_time = time.time()
    # print(f"Time taken: {end_time - start_time:.2f} seconds")
    # return [fact_checked]

# query
# prediction
# justification
# sources: [links]
# lang: "en"