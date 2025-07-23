import json
import random
from config import openai_client

# Load templates once
with open("data/email_templates.json", "r", encoding="utf-8") as f:
    templates = json.load(f)

# Generate Upwork proposal using category and JD/title
def generate_upwork_proposal(job_data: dict, category: str) -> str:
    title = job_data.get("title", "")
    description = job_data.get("description", job_data.get("descriptionText", ""))
    category = category.strip()

    # Try to fetch category-level reference block
    domain_templates = templates.get("upwork", {})
    category_data = domain_templates.get(category)

    if not category_data:
        return f"No reference template found for selected category: {category}"

    # Choose a random reference email to diversify
    references = category_data.get("references", [])
    if not references:
        return f"No reference email available for category: {category}"

    reference_email = random.choice(references)
    global_prompt = templates.get("prompt", "")

    # Construct prompt
    prompt = (
        f"{global_prompt}\n\n"
        f"Reference Email:\n{reference_email}\n\n"
        f"Job Title: {title}\n"
        f"Job Description:\n{description}\n\n"
        f"Please draft accordingly."
    )

    # OpenAI API Call
    response = openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )

    return response.choices[0].message.content.strip()
