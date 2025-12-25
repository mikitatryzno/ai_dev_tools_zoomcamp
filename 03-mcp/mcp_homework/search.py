# search.py - corrected version
import os
import requests
import zipfile
import json
from minsearch import Index

# Global variable to store the index
search_index = None
documents = None

def download_and_index_docs():
    """
    Download the fastmcp repository, extract markdown files, and index them with minsearch.
    """
    global search_index, documents
    
    zip_url = "https://github.com/jlowin/fastmcp/archive/refs/heads/main.zip"
    zip_path = "fastmcp-main.zip"
    
    # Download the zip file if it doesn't exist
    if not os.path.exists(zip_path):
        print(f"Downloading {zip_url}...")
        response = requests.get(zip_url)
        with open(zip_path, "wb") as f:
            f.write(response.content)
    else:
        print(f"Using existing zip file: {zip_path}")
    
    # Extract and process markdown files
    print("Extracting and indexing markdown files...")
    documents = []
    
    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        for file_info in zip_ref.infolist():
            filename = file_info.filename
            if filename.endswith((".md", ".mdx")):
                # Remove the first part of the path
                parts = filename.split("/", 1)
                if len(parts) > 1:
                    clean_filename = parts[1]
                else:
                    clean_filename = filename
                
                # Read the file content
                with zip_ref.open(file_info) as file:
                    content = file.read().decode("utf-8", errors="ignore")
                
                # Add to documents list
                doc = {
                    "filename": clean_filename,
                    "content": content
                }
                documents.append(doc)
    
    # Create and fit the index
    search_index = Index(text_fields=["content", "filename"])
    search_index.fit(documents)
    
    # Save the documents for future reference
    with open("fastmcp_docs.json", "w") as f:
        json.dump(documents, f)
    
    print(f"Indexed {len(documents)} markdown files from the fastmcp repository")

def search_docs(query, limit=5):
    """
    Search the indexed documents for a query.
    
    Args:
        query: The search query
        limit: Maximum number of results to return (default: 5)
        
    Returns:
        A list of search results
    """
    global search_index, documents
    
    # If we don't have an index yet, create one
    if search_index is None:
        # If we have saved documents, load them and create the index
        if os.path.exists("fastmcp_docs.json"):
            print("Loading documents from file...")
            with open("fastmcp_docs.json", "r") as f:
                documents = json.load(f)
            
            print("Creating search index...")
            search_index = Index(text_fields=["content", "filename"])
            search_index.fit(documents)
        else:
            # If no saved documents, download and index
            download_and_index_docs()
    
    # Search the index
    results = search_index.search(query, num_results=limit)
    
    return results

if __name__ == "__main__":
    # Create index if needed
    if search_index is None:
        if os.path.exists("fastmcp_docs.json"):
            print("Loading existing documents and creating index...")
            with open("fastmcp_docs.json", "r") as f:
                documents = json.load(f)
            
            search_index = Index(text_fields=["content", "filename"])
            search_index.fit(documents)
        else:
            download_and_index_docs()
    
    # Test the search function
    query = "demo"
    results = search_docs(query)
    
    print(f"\nSearch results for '{query}':")
    
    # Let's first inspect the structure of the results
    if results:
        print("Result structure example:")
        first_result = results[0]
        print(first_result)
        print("\nActual results:")
        
        # Print results based on the actual structure
        for i, result in enumerate(results):
            # Try to handle different possible result structures
            try:
                if isinstance(result, dict):
                    # If result is a dictionary, try different key combinations
                    if 'filename' in result:
                        filename = result['filename']
                        score = result.get('score', 'N/A')
                        print(f"{i+1}. {filename} (score: {score})")
                    elif 'document' in result and 'filename' in result['document']:
                        filename = result['document']['filename']
                        score = result.get('score', 'N/A')
                        print(f"{i+1}. {filename} (score: {score})")
                    else:
                        # Just print the whole result
                        print(f"{i+1}. {result}")
                else:
                    # If result is not a dictionary, just print it
                    print(f"{i+1}. {result}")
            except Exception as e:
                print(f"{i+1}. Error displaying result: {e}")
                print(f"Raw result: {result}")
    else:
        print("No results found.")