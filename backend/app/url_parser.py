
import requests
from bs4 import BeautifulSoup
import nltk
from urllib.parse import urlparse

# Download NLTK data files (if not already downloaded)
nltk.download('punkt')

def scrape_and_write_paragraphs(input_path):
    try:
        # Determine if the input is a URL or a file path
        parsed_url = urlparse(input_path)
        # print(parsed_url)
        if parsed_url.scheme in ('http', 'https'):
            # Fetch the content from the URL
            response = requests.get(input_path)
            response.raise_for_status()
            content = response.text
        else:
            # Open and read the local HTML file
            with open(input_path, 'r', encoding='utf-8') as file:
                content = file.read()

        # Parse the HTML content using BeautifulSoup
        soup = BeautifulSoup(content, 'html.parser')

        # Extract all text from the paragraphs
        paragraphs = [p.get_text() for p in soup.find_all('p')]

        # Write each paragraph to a separate line in a text file
        with open('input.txt', 'w', encoding='utf-8') as output_file:
            for paragraph in paragraphs:
                output_file.write(paragraph + '\n')

        return paragraphs

    except Exception as e:
        print(f"An error occurred: {e}")
        return []