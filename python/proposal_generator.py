import json
import random
from config import openai_client

# Load and merge templates
with open("python/templates/email_templates.json", "r", encoding="utf-8") as f:
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

    response = openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )

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

    response = openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )

    return response.choices[0].message.content.strip()
