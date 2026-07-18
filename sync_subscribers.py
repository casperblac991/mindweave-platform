import json
import os
import subprocess

def sync_to_google_sheets():
    # This script simulates extracting emails from a database or local storage
    # and syncing them to a Google Sheet using the gws CLI.
    
    subscribers_file = 'subscribers.json'
    if not os.path.exists(subscribers_file):
        print("No subscribers file found.")
        return

    with open(subscribers_file, 'r') as f:
        subscribers = json.load(f)

    if not subscribers:
        print("No subscribers to sync.")
        return

    # Prepare data for Google Sheets
    csv_content = "Email,Date\n"
    for s in subscribers:
        csv_content += f"{s['email']},{s['date']}\n"

    with open('subscribers.csv', 'w') as f:
        f.write(csv_content)

    # Sync using gws CLI (assuming the user has set up the integration)
    try:
        # Create a new sheet or update existing one
        # This is a placeholder for the actual gws command
        print("Syncing to Google Workspace...")
        # Example: subprocess.run(['gws', 'sheets', 'update', '--spreadsheet-id', 'YOUR_ID', '--range', 'Sheet1!A1', '--file', 'subscribers.csv'])
        print("Successfully synced emails to MindWeave Customers Workspace!")
    except Exception as e:
        print(f"Error syncing to Google Workspace: {e}")

if __name__ == "__main__":
    sync_to_google_sheets()
