from openai import OpenAI
from config import OPENAI_API_KEY, PINECONE_API_KEY
from pinecone import Pinecone
from utils.get_embedding import get_embedding
from tqdm import tqdm

client = OpenAI(api_key=OPENAI_API_KEY)
pc = Pinecone(api_key=PINECONE_API_KEY)

index = pc.Index("services-index")  # Combined index

def retrieve_best_match(query: str):
    query_embedding = get_embedding(query)
    results = index.query(vector=query_embedding, top_k=1, include_metadata=True)

    if results and results["matches"]:
        match = results["matches"][0]
        metadata = match["metadata"]
        return metadata["content"], metadata["source_name"], metadata["source_type"]
    
    return None, None, None

def generate_remark(job, context_chunk, match_name, match_type):
    title = job.get("title", "")
    desc = job.get("descriptionText") or job.get("description", "")

    if not context_chunk:
        return "Unable to confidently recommend a product or service for this job."

    prompt = (
    f"STRICT CO-VENTECH JOB ANALYST RULES:\n"
    f"1. MUST recommend ONE SPECIFIC SERVICE (25 words max) unless job contains EXACT product phrases below\n"
    f"2. Service recommendations MUST cite job-specific tech/tools/needs\n\n"
    
    f"🔷 APPROVED PRODUCT TRIGGERS (ONLY THESE):\n"
    f"- Recruitinn: 'bulk hiring' OR 'filter applicants' OR 'remote hiring platform'\n"
    f"- SkillBuilder: 'React/AWS teacher' OR 'building LMS platform'\n"
    f"- Co-Vental: 'vetted candidates trial' OR 'managing recruitment partners'\n\n"
    
    f"🔷 SERVICE SELECTION GUIDE:\n"
    f"1. QA/Test Automation: Mention if job has 'testing'/'QA'/'automation'/'Selenium'\n"
    f"2. AI/ML: Mention 'AI'/'ML'/'LLM'/'GPU algorithms'/'NLP'\n"
    f"3. Software Dev: Mention specific stacks ('MERN'/'Python'/'mobile apps')\n"
    f"4. DevOps: Mention 'CI/CD'/'cloud migration'/'Kubernetes'\n"
    f"5. Cybersecurity: Mention 'pentesting'/'SOC'/'vulnerability assessment'\n"
    f"6. UI/UX: 'Figma'/'Adobe XD'/'user research'/'wireframing'/'design system'/'prototyping'\n\n"
    
    f"---\n"
    f"JOB DATA:\n"
    f"Title: {title}\n"
    f"Description: {desc[:1000]}\n\n"
    
    f"DELIVER OUTPUT IN THIS EXACT FORMAT:\n"
    f"1. For SERVICES (95% cases):\n"
    f"   \"Recommend [SPECIFIC_SERVICE] because [JOB-SPECIFIC_TECH/TOOLS/NEEDS]\" (EXACTLY 25 WORDS)\n"
    f"2. For PRODUCTS (5% cases):\n"
    f"   \"[PRODUCT_MATCH] Recommending [PRODUCT] for [EXACT_MATCHED_PHRASE]\"\n\n"
    
    f"BAD EXAMPLE (REJECT):\n"
    f"\"Recommend Services because job aligns with Co-Ventech\" → TOO GENERIC\n"
    f"GOOD EXAMPLE (APPROVED):\n"
    f"\"Recommend AI/ML services for GPU algorithm optimization using CUDA and TensorFlow\" (25 words)"
)

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"[AI Remark Error: {str(e)}]"

def generate_ai_remark(jobs):
    for job in tqdm(jobs, desc="Generating AI Remarks"):
        query = f"{job.get('title', '')} {job.get('descriptionText') or job.get('description', '')}"
        context, match_name, match_type = retrieve_best_match(query)
        job["ai_remark"] = generate_remark(job, context, match_name, match_type)
    return jobs
