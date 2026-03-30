from langdetect import detect
import json
import google.generativeai as genai
import pandas as pd
import re

import requests

OPENAI_API_KEY = ""

# Set Gemini API key for translation (replace with your key)
genai.configure(api_key="")

# Original multilingual news input

# Step 1: Detect Language
def detect_language(text):
    try:
        return detect(text)
    except:
        return "unknown"

# Step 2: Translate if needed
def translate_to_english(text):
    model = genai.GenerativeModel('gemini-2.0-flash')
    translation_prompt = f"Translate the following multilingual news snippets to English, preserving their meaning and tone:\n\n{text}"
    response = model.generate_content(translation_prompt)
    return response.text.strip()

# Step 3: Conditional translation
def processInput(user_input , language):
    language = detect_language(user_input)
    if language != "en":
        print(f"Detected language: {language}. Translating to English...")
        processed_input = translate_to_english(user_input)
    else:
        print("Input is already in English. Skipping translation.")
        processed_input = user_input
    return processed_input

def generatePrompt(processed_input, language):
    prompt = f"""
    Task:
    You are an intelligent assistant. Your task is to extract and group related news content from the following user input. The input may contain multiple news fragments or lines that refer to the same news topic. You must identify and group all related lines together into coherent news clusters.
    Instructions:
    Analyze the paragraph below.
    {processed_input}
    Identify distinct news items.
    Group lines or fragments referring to the same news together.
    Return the result as a JSON array where each item is a dictionary with:
    "news": A concatenated paragraph formed by combining all fragments or lines related to that news.
    "lines": List of the original input lines included in this group (optional but useful for traceability).
    "language": {language}
    """
    return prompt

def main(user_input):
    # user_input = """लोकसभा के बाद अब राज्यसभा में भी वक्फ संशोधन विधेयक पास हो गया। लंबी बहस के बाद केंद्र की नरेंद्र मोदी सरकार उच्च सदन में भी इसे पारित कराने में सफल रही। देर रात दो बजे के बाद बिल पर वोटिंग हुई और बिल पारित हो गया। जानिए पक्ष और विपक्ष में कितने वोट पड़े।"""
    language = detect_language(user_input)
    processed_input = processInput(user_input, language)
    prompt = generatePrompt(processed_input, language)
    response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            json={"model": "gpt-3.5-turbo", "messages": [{"role": "user", "content": prompt}], "max_tokens": 4000},
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"},
        )

    if response.status_code == 200:
            # print(response.json().get("choices", [{}])[0].get("message", {}).get("content", "No response from OpenAI."))
            return(response.json().get("choices", [{}])[0].get("message", {}).get("content", "No response from OpenAI."))
    else:
        print(f"Error with OpenAI API: {response.status_code}, {response.text}")
