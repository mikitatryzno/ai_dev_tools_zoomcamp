# count_data.py
import requests

def scrape_web(url: str) -> str:
    """Download content of any web page in markdown format using Jina reader."""
    jina_url = f"https://r.jina.ai/{url}"
    response = requests.get(jina_url)
    
    if response.status_code == 200:
        return response.text
    else:
        return f"Error: Failed to retrieve content. Status code: {response.status_code}"

def count_word_occurrences(text: str, word: str) -> int:
    """Count how many times a word appears in a text."""
    return text.lower().count(word.lower())

# Main execution
url = "https://datatalks.club/"
word = "data"

content = scrape_web(url)
count = count_word_occurrences(content, word)

print(f"The word '{word}' appears {count} times on {url}")