import csv
import json
import concurrent.futures
import os
import re
import requests
import time
from deep_translator import GoogleTranslator
import google.generativeai as genai
# API Credentials
API_KEY = ""
CX = "905d41aa20b0e4e1a"
OPENAI_API_KEY = ""
diffbot_keys = [
    "a9f33c4419e33a0e36a18ce9c4fc92ff",
    "9d585dd8f9661f9c77e26e96b11b3205",
    "faca87bd6bdbf26c732059ab9cab3e00"
]
QUERY = """Samay Raina summoned amid India's got latent controversy"""
language = "hi" # ISO 639-1

def fetch_links(query):
    """Fetch top 3 search results excluding YouTube, Facebook, and Instagram."""
    url = f"https://www.googleapis.com/customsearch/v1?q=news - {query}&key={API_KEY}&cx={CX}&num=5"
    response = requests.get(url)

    if response.status_code != 200:
        print(f"❌ Error fetching search results: {response.status_code}, {response.text}")
        return []

    data = response.json()
    blocked_domains = {"youtube.com", "facebook.com", "instagram.com"}
    
    links = [
        item["link"]
        for item in data.get("items", [])
        if not any(domain in item["link"] for domain in blocked_domains)
    ][:3]  # Pick first 3 non-blocked links directly

    return links


def fetch_article(api_key, url):
    api_url = f"https://api.diffbot.com/v3/article?token={api_key}"
    try:
        response = requests.get(api_url, params={"url": url, "naturalLanguage": "summary"})
        data = response.json()
        if "objects" in data and len(data["objects"]) > 0:
            return data["objects"][0].get("naturalLanguage", {}).get("summary", "No summary found")[:1000]
    except requests.exceptions.RequestException as e:
        return {str(e)}

def fact_check(query, scraped_content, links):
    prompt = f"""
    You are a fact-checker.
    Check whether the following claim is true or false based on the sources provided below:

    Claim: News-"{query}"

    Sources:
    {scraped_content}

    Respond in the following JSON format:
    {{
    "query": {query},
    "prediction": "True" or "False",
    "justification": "Provide a detailed justification based on the sources provided.",
    "sources": {links},
    "lang":'en'
    }}
    enclose all {links} in double quotes
    """

    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        json={"model": "gpt-3.5-turbo", "messages": [{"role": "user", "content": prompt}], "max_tokens": 1000},
        headers={"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"},
    )

    if response.status_code == 200:
        raw_response = response.json().get("choices", [{}])[0].get("message", {}).get("content", "No response from OpenAI.")
        print("raw response: ")
        print(raw_response)
        try:
            fact_check_json = json.loads(raw_response)
            # fact_check_json = raw_response
            # print(raw_response)
        except json.JSONDecodeError as e:
            print("Failed to parse JSON from OpenAI response:", e)
            fact_check_json = json.loads("{}")
        # return response.json().get("choices", [{}])[0].get("message", {}).get("content", "No response from OpenAI.")
        return fact_check_json
    else:
        print(f"Error with OpenAI API: {response.status_code}, {response.text}")
        return fact_check_json

def translate_result(fact_check_result, target_language):
    if target_language.lower() == "en":
        return None
    else:
        original_query = fact_check_result.get("query", "")
        original_justification = fact_check_result.get("justification", "")
        try:
            translated_query = GoogleTranslator(source='en', target=target_language).translate(original_query)
            translated_justification = GoogleTranslator(source='en', target=target_language).translate(original_justification)
        except Exception as e:
            translated_justification = "Translation failed: " + str(e)
        return {
            "query": translated_query,
            "prediction": fact_check_result.get("prediction", ""),
            "justification": translated_justification,
            "sources": fact_check_result.get("sources", []),
            "lang":target_language
        }
    
def main(query, language):
    # query = "Trump imposes high tarrif on India"
    # language = "hi"
    start_time = time.time()

    # start_time_fetch = time.time()
    links = fetch_links(query)
    # end_time_fetch = time.time()

    url_key_pairs = list(zip(diffbot_keys, links))

    # start_time_scrape = time.time()
    # Execute the fetch operations concurrently
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        results = list(executor.map(lambda pair: fetch_article(*pair), url_key_pairs))
    # end_time_scrape = time.time()

    # start_time_openai = time.time()
    fact_check_result = fact_check(query, results, links)
    # end_time_openai = time.time()
    # fact_check_result = json.loads(fact_check_result.strip())
    # start_time_translate = time.time()
    translated_result = translate_result(fact_check_result, language)
    # end_time_translate = time.time()

    end_time = time.time()
    # print([fact_check_result, translated_result])
    # print("\n📌 Fact-Check Result:")
    # print(fact_check_result)
    # print("\n📌 Translated Result:")
    # print(translated_result)
    # print(f"\n⏱️ Total Execution Time fetching links: {end_time_fetch - start_time_fetch:.2f} seconds")
    # print(f"\n⏱️ Total Execution Time scraping web: {end_time_scrape - start_time_scrape:.2f} seconds")
    # print(f"\n⏱️ Total Execution Time openai prompt: {end_time_openai - start_time_openai:.2f} seconds")
    # print(f"\n⏱️ Total Execution Time translation: {end_time_translate - start_time_translate:.2f} seconds")
    print(f"\n⏱️ Total Execution Time: {end_time - start_time:.2f} seconds")
    if translated_result is None:
        return [fact_check_result]
    else:
        return [fact_check_result, translated_result]

# main()