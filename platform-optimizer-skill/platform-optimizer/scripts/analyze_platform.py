import sys
import os
import requests
from bs4 import BeautifulSoup

def analyze_url(url):
    print(f"--- Starting Automated Analysis for: {url} ---")
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        title = soup.title.string if soup.title else "No Title Found"
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        meta_desc = meta_desc['content'] if meta_desc else "No Description Found"
        
        links = len(soup.find_all('a'))
        images = len(soup.find_all('img'))
        scripts = len(soup.find_all('script'))
        
        print(f"Title: {title}")
        print(f"Meta Description: {meta_desc}")
        print(f"Total Links: {links}")
        print(f"Total Images: {images}")
        print(f"Total Scripts: {scripts}")
        
        # Check for common tech
        tech_stack = []
        if soup.find('meta', attrs={'name': 'generator'}):
            tech_stack.append(soup.find('meta', attrs={'name': 'generator'})['content'])
        
        print(f"Detected Tech: {tech_stack}")
        return {
            "url": url,
            "title": title,
            "description": meta_desc,
            "links": links,
            "images": images,
            "scripts": scripts
        }
    except Exception as e:
        print(f"Error analyzing URL: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 analyze_platform.py <url>")
    else:
        analyze_url(sys.argv[1])
