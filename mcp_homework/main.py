from fastmcp import FastMCP
import requests
import os
import zipfile
import json
from minsearch import Index

# Global variables to store the search index and documents
search_index = None
documents = None

mcp = FastMCP("Demo 🚀")

@mcp.tool
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

@mcp.tool
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

@mcp.tool
def download_and_index_docs() -> str:
    """
    Download the fastmcp repository, extract markdown files, and index them with minsearch.
    
    Returns:
        A message indicating the indexing is complete
    """
    global search_index, documents
    
    zip_url = "https://github.com/jlowin/fastmcp/archive/refs/heads/main.zip"
    zip_path = "fastmcp-main.zip"
    
    # Download the zip file if it doesn't exist
    if not os.path.exists(zip_path):
        response = requests.get(zip_url)
        with open(zip_path, "wb") as f:
            f.write(response.content)
    
    # Extract and process markdown files
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
    
    return f"Indexed {len(documents)} markdown files from the fastmcp repository"

@mcp.tool
def search_docs(query: str, limit: int = 5) -> str:
    """
    Search the indexed documents for a query.
    
    Args:
        query: The search query
        limit: Maximum number of results to return (default: 5)
        
    Returns:
        A formatted string with search results
    """
    global search_index, documents
    
    # If we don't have an index yet, create one
    if search_index is None:
        # If we have saved documents, load them and create the index
        if os.path.exists("fastmcp_docs.json"):
            with open("fastmcp_docs.json", "r") as f:
                documents = json.load(f)
            
            search_index = Index(text_fields=["content", "filename"])
            search_index.fit(documents)
        else:
            # If no saved documents, download and index
            return "Index not found. Please run download_and_index_docs first."
    
    # Search the index
    results = search_index.search(query, num_results=limit)
    
    # Format the results
    if not results:
        return "No results found."
    
    formatted_results = "Search results:\n\n"
    
    for i, result in enumerate(results):
        # Extract the filename and score based on the actual structure
        # The structure might vary, so we need to handle different cases
        try:
            # Get the document from the result
            doc = result.get('document', result)
            
            # Get the filename from the document
            if isinstance(doc, dict) and 'filename' in doc:
                filename = doc['filename']
            else:
                filename = str(doc)
            
            # Get the score if available
            score = result.get('score', 'N/A')
            
            formatted_results += f"{i+1}. {filename}"
            if score != 'N/A':
                formatted_results += f" (score: {score:.4f})"
            formatted_results += "\n"
        except Exception as e:
            formatted_results += f"{i+1}. Error displaying result: {str(e)}\n"
    
    return formatted_results

if __name__ == "__main__":
    mcp.run()