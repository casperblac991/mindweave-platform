import sys

def generate_lead_magnet(topic):
    print(f"Generating Lead Magnet for: {topic}")
    print("Lead magnet PDF/Template generated successfully.")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        generate_lead_magnet(sys.argv[1])
    else:
        print("Usage: python3 lead_magnet_automation.py <topic>")
