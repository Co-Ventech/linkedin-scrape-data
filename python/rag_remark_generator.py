import json
from tqdm import tqdm
from config import pinecone_client, openai_client
from utils import get_embedding

# Load final job data
with open("data/scored_jobs_output.json", "r", encoding="utf-8") as f:
    jobs = json.load(f)

# Pinecone indexes
product_index = pinecone_client.Index("products-index")
service_index = pinecone_client.Index("services-index")

# Query logic
def retrieve_best_match(query: str):
    query_emb = get_embedding(query)

    prod_match = product_index.query(vector=query_emb, top_k=1, include_metadata=True)
    serv_match = service_index.query(vector=query_emb, top_k=1, include_metadata=True)

    prod = prod_match.get("matches", [])[0] if prod_match.get("matches") else None
    serv = serv_match.get("matches", [])[0] if serv_match.get("matches") else None

    prod_score = prod["score"] if prod else 0
    serv_score = serv["score"] if serv else 0

    if prod_score >= serv_score:
        return prod["metadata"]["service_name"], "product"
    elif serv:
        return serv["metadata"]["service_name"], "service"
    return None, None

# AI remark generation
def generate_remark(job, match_name, match_type):
    title = job.get("title", "")
    
    # Support both LinkedIn (`descriptionText`) and Upwork (`description`)
    desc = job.get("descriptionText") or job.get("description") or ""
    
    score = job.get("final_score", 0)
    tier = job.get("tier", "Red")
    
    if not match_name:
        return f"This job has a final score of {score} ({tier} Tier), but it doesn't clearly align with our services or products."

    prompt = (
        f"You are an expert job analyst AI assistant working for a software consultancy (Co-Ventech) that offers services like QA Automation, DevOps, Cybersecurity, UI/UX, and products like Recruitinn (Recruitment AI), SkillBuilder (LMS), and Co-Vental (Staff Augmentation).\nYour task is to assess whether a given job is a good fit for outreach or not, and recommend a concise, to the point , 1 line remark. Use the job's score and tier, make sure you do not add this in the remark, and compare with other similar job titles.\n"
        f"Job Title: {title}\n"
        f"Description: {desc[:1000]}\n"
        f"Score: {score}, Tier: {tier}\n"
        f"Matched {match_type}: {match_name}\n\n"
        f"Write a concse, to the point, 1 liner remark explaining why this job aligns well and should be pitched with this {match_type}."
    )

    response = openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.6,
    )

    return response.choices[0].message.content.strip()

# Main callable function from main model
def generate_ai_remark(jobs):
    for job in tqdm(jobs, desc="Generating AI Remarks"):
        query = f"{job.get('title', '')} {job.get('descriptionText', '')}"
        match_name, match_type = retrieve_best_match(query)
        job["ai_remark"] = generate_remark(job, match_name, match_type)

    return jobs

