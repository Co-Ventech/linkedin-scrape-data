import json
import random
import sys
import traceback
import os
from config import openai_client

# --- Debug print: script started ---
# print("PYTHON: Script started", file=sys.stderr)
sys.stderr.flush()

# Load and merge templates using absolute path
base_dir = os.path.dirname(__file__)
template_path = os.path.join(base_dir, "templates", "email_templates.json")
# print(f"PYTHON: Loading templates from {template_path}", file=sys.stderr)
sys.stderr.flush()
with open(template_path, "r", encoding="utf-8") as f:
    raw_templates = json.load(f)

# email_templates.json is a list of 2 dictionaries: [upwork_block, linkedin_block]
# Merge into one dict for easy lookup
templates = {}
for block in raw_templates:
    templates.update(block)

# -----------------------
# Upwork Proposal Generator
# -----------------------
def generate_upwork_proposal(job_data: dict, category: str) -> str:
    title = job_data.get("title", "")
    description = job_data.get("description", job_data.get("descriptionText", ""))
    category = category.strip()

    upwork_templates = templates.get("upwork", {})
    prompt_base = upwork_templates.get("prompt", "")
    category_data = upwork_templates.get(category)

    if not category_data:
        return f"No reference template found for selected category: {category}"

    references = category_data.get("references", [])
    if not references:
        return f"No reference email available for category: {category}"

    reference = random.choice(references)

    prompt = (
        f"{prompt_base}\n\n"
        f"Reference Email:\n{reference}\n\n"
        f"Job Title: {title}\n"
        f"Job Description:\n{description}\n\n"
        f"Please draft accordingly."
    )

    # print("PYTHON: Before OpenAI call (Upwork)", file=sys.stderr)
    sys.stderr.flush()
    response = openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    # print("PYTHON: After OpenAI call (Upwork)", file=sys.stderr)
    sys.stderr.flush()

    return response.choices[0].message.content.strip()

# -----------------------
# LinkedIn Pitch Generator
# -----------------------
def generate_linkedin_proposal(job_data: dict, category: str, is_product: bool = False) -> str:
    title = job_data.get("title", "")
    description = job_data.get("description", job_data.get("descriptionText", ""))

    linkedin_templates = templates.get("linkedin", {})
    prompt_base = linkedin_templates.get("prompt", "")

    references = []

    if is_product:
        # Product pitch path
        references = linkedin_templates.get("products", {}).get(category, [])
    else:
        # Service pitch path
        service_data = linkedin_templates.get("services", {}).get(category, {})

        if isinstance(service_data, dict):
            # Direct references
            if "references" in service_data:
                references = service_data["references"]
            else:
                # Nested sub-services (e.g., QA → automation/performance)
                for subcat_refs in service_data.values():
                    references.extend(subcat_refs)

    if not references:
        return f"No reference messages found for category: {category}"

    reference = random.choice(references)

    prompt = (
        f"{prompt_base}\n\n"
        f"Reference Style (DO NOT COPY):\n{reference}\n\n"
        f"Job Title: {title}\n"
        f"Job Description:\n{description}\n\n"
        f"Generate a 4-6 sentence message with:\n"
        f"1. MUST start with 'Hi [First Name]' or 'Hey [First Name]' on new line\n"
        f"2. First sentence: Problem from job description\n"
        f"3. Middle sentences: Tailored value + plausible metric\n"
        f"4. Last sentence: Natural CTA (no forced time-bound)\n"
        f"5. MUST end with 'Best regards, [Your Name]' or similar\n\n"
        f"Rules:\n"
        f"- Never replicate reference message\n"
        f"- Metrics must align with job context\n"
        f"- Prioritize JD keywords over generic phrases"
    )

    # print("PYTHON: Before OpenAI call (LinkedIn)", file=sys.stderr)
    sys.stderr.flush()
    response = openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    # print("PYTHON: After OpenAI call (LinkedIn)", file=sys.stderr)
    sys.stderr.flush()

    return response.choices[0].message.content.strip()

# if __name__ == "__main__":
#     try:
#         import argparse
#         parser = argparse.ArgumentParser()
#         parser.add_argument("--type", choices=["linkedin", "upwork"], required=True)
#         parser.add_argument("--job", type=str, required=True)
#         parser.add_argument("--category", type=str, required=True)
#         parser.add_argument("--is_product", action="store_true")
#         args = parser.parse_args()

#         # print("PYTHON: Arguments parsed", file=sys.stderr)
#         sys.stderr.flush()

#         job = json.loads(args.job)
#         if args.type == "linkedin":
#             result = generate_linkedin_proposal(job, args.category, args.is_product)
#         else:
#             result = generate_upwork_proposal(job, args.category)
#         # print(json.dumps({"proposal": result}))
#         sys.stdout.flush()
#         # print("PYTHON: Script finished", file=sys.stderr)
#         sys.stderr.flush()
#     except Exception as e:
#         # print("PYTHON ERROR:", e, file=sys.stderr)
#         traceback.print_exc()
#         sys.exit(1)

if __name__ == "__main__":
    try:
        import argparse
        parser = argparse.ArgumentParser()
        parser.add_argument("--type", choices=["linkedin", "upwork"], required=True)
        parser.add_argument("--job", type=str, required=True)
        parser.add_argument("--category", type=str, required=True)
        parser.add_argument("--is_product", action="store_true")
        args = parser.parse_args()

        # print("PYTHON: Arguments parsed", file=sys.stderr)  # Keep for debugging
        sys.stderr.flush()

        job = json.loads(args.job)

        if args.type == "linkedin":
            result = generate_linkedin_proposal(job, args.category, args.is_product)
        else:
            result = generate_upwork_proposal(job, args.category)

        # Output the result as JSON (uncommented and ensured)
        print(json.dumps({"proposal": result}))
        sys.stdout.flush()

        # print("PYTHON: Script finished", file=sys.stderr)  # Keep for debugging
        sys.stderr.flush()
    except Exception as e:
        # Output error as JSON for better Node.js handling
        print(json.dumps({"error": str(e)}))
        sys.stdout.flush()
        traceback.print_exc()
        sys.exit(1)
