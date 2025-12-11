"""
Example script showing how to publish an obituary via the API.

This is a reference implementation - not meant for production use.
"""

import requests
import json
from datetime import datetime

# API Configuration
API_BASE_URLS = {
    "dev": "https://h8j5wx2ek8.execute-api.us-east-1.amazonaws.com/dev",
    "stage": "https://osw92dhpje.execute-api.us-east-1.amazonaws.com/stage",
    "prod": "https://eqvuex5md7.execute-api.us-east-1.amazonaws.com/prod"
}

API_ENDPOINT = "/v1/obituaries/"


def publish_obituary(api_key, environment="prod", payload=None):
    """
    Publish an obituary to the Legacy.com API.
    
    Args:
        api_key: Your API key for authentication
        environment: One of "dev", "stage", or "prod"
        payload: The obituary data as a dictionary
    
    Returns:
        Response object with obituary_id and redirector_url on success
    """
    base_url = API_BASE_URLS.get(environment, API_BASE_URLS["prod"])
    url = f"{base_url}{API_ENDPOINT}"
    
    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, headers=headers, json=payload)
    
    # Raise exception for HTTP errors
    response.raise_for_status()
    
    return response.json()


def create_example_payload():
    """
    Create an example payload structure.
    Modify this with actual obituary data.
    """
    today = datetime.now().strftime("%Y-%m-%d")
    
    payload = {
        "person": {
            "name": {
                "first": "John",
                "last": "Doe",
                "middle": "Q",
                "suffix": "Jr."
            },
            "date_of_birth": "01221926",  # MMDDYYYY format
            "date_of_death": "05152021",  # MMDDYYYY format
            "age": 95
        },
        "obituary": {
            "obituary_text": "John Q. Doe Jr., 95, passed away peacefully on May 15, 2021. "
                           "He was a beloved husband, father, and grandfather. "
                           "Services will be held at...",
            "publish_start_date": today,  # YYYY-MM-DD format
            "publish_end_date": None,  # Optional
            "obituary_type": "paid"  # or "free"
        },
        "source_info": {
            "source_type": "publisher",  # or "adn"
            "source": "ipublish",  # Your source identifier
            "source_reference_id": "1000",  # Your reference ID for this obituary
            "provider": "ipublish",  # Required for publisher type
            "provider_reference_id": "1000",  # Required for publisher type
            "owner": "chicagotribune",  # Required for publisher type
            "owner_reference_id": "a7500"  # Required for publisher type
        },
        "version": datetime.now().isoformat()  # Optional: version tracking
    }
    
    return payload


if __name__ == "__main__":
    # Example usage
    # IMPORTANT: Replace with your actual API key
    API_KEY = "your-api-key-here"
    
    # Create the payload
    payload = create_example_payload()
    
    try:
        # Publish the obituary
        result = publish_obituary(
            api_key=API_KEY,
            environment="prod",  # Change to "dev" or "stage" for testing
            payload=payload
        )
        
        print("✅ Success!")
        print(f"Obituary ID: {result.get('obituary_id')}")
        print(f"Redirector URL: {result.get('redirector_url')}")
        
        if result.get('warnings'):
            print(f"⚠️  Warnings: {result.get('warnings')}")
            
    except requests.exceptions.HTTPError as e:
        print(f"❌ HTTP Error: {e.response.status_code}")
        print(f"Response: {e.response.text}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Request Error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

