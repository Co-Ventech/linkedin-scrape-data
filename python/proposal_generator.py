import json
from config import openai_client

# Load templates
with open("data/email_templates.json", "r", encoding="utf-8") as f:
    templates = json.load(f)

# Main proposal generation function for Upwork
def generate_upwork_proposal(job_data: dict, category: str) -> str:
    title = job_data.get("title", "")
    description = job_data.get("description", job_data.get("descriptionText", ""))
    
    # Fetch template block
    category_data = templates["upwork"].get(category)
    if not category_data:
        return "No matching proposal template found for the given category."

    skeleton = category_data["skeleton"]
    prompt_text = category_data["prompt"]

    # Build prompt
    prompt = (
    f"{category_data['prompt']}\n\n"
    f"Skeleton:\n{skeleton}\n\n"
    f"Job Title: {title}\n"
    f"Job Description:\n{description}\n\n"
    f"Generate a fully customized Upwork proposal in 3 short paragraphs. "
    f"Use a professional, humanize tone and keep it relevant to the job post. "
    f"Do not repeat any existing template exactly. Use the skeleton as inspiration only."
)


    # Call OpenAI
    response = openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )

    return response.choices[0].message.content.strip()
