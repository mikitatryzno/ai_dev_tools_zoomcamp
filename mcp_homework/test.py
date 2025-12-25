# test.py
import requests

def scrape_web(url: str) -> str:
    """
    Download content of any web page in markdown format using Jina reader.
    
    Args:
        url: The URL of the web page to scrape
        
    Returns:
        The content of the web page in markdown format
    """
    jina_url = f"https://r.jina.ai/{url}"
    response = requests.get(jina_url)
    
    if response.status_code == 200:
        return response.text
    else:
        return f"Error: Failed to retrieve content. Status code: {response.status_code}"

# Test the function with the specified URL
url = "https://github.com/alexeygrigorev/minsearch"
content = scrape_web(url)

# Print the character count and a preview of the content
print(f"Number of characters: {len(content)}")
print("\nPreview of content:")
print(content[:500])  # Print first 500 characters