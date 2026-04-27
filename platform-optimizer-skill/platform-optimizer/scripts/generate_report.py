import sys
import os

def generate_report(template_name, output_path, replacements):
    template_path = f"/home/ubuntu/skills/platform-optimizer/templates/{template_name}"
    if not os.path.exists(template_path):
        print(f"Template {template_name} not found.")
        return

    with open(template_path, 'r', encoding='utf-8') as f:
        content = f.read()

    for key, value in replacements.items():
        content = content.replace(f"[{key}]", str(value))

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Report generated at: {output_path}")

if __name__ == "__main__":
    # Example usage: python3 generate_report.py 1_platform_analysis_template.md analysis.md "اسم المنصة=MindWeave"
    if len(sys.argv) < 4:
        print("Usage: python3 generate_report.py <template_name> <output_path> <replacements_str>")
    else:
        template = sys.argv[1]
        output = sys.argv[2]
        replacements_raw = sys.argv[3:]
        replacements = {}
        for item in replacements_raw:
            if '=' in item:
                k, v = item.split('=', 1)
                replacements[k] = v
        generate_report(template, output, replacements)
