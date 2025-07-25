import os
import json
import pandas as pd
import re
from datetime import datetime
from rag_remark_generator import generate_ai_remark
from proposal_generator import generate_upwork_proposal


# === Setup path to load the Upwork job JSON file ===
base_dir = os.path.dirname(__file__)
file_path = os.path.join(base_dir, '..', 'data', 'filtered_upwork.json') 
output_path = os.path.join(base_dir, '..', 'data', 'final_jobs_upwork.json')

# === Load JSON data ===
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# === Normalize JSON depending on structure ===
if isinstance(data, dict) and 'data' in data:
    jobs = data['data']
elif isinstance(data, list):
    jobs = data
else:
    raise ValueError("Unrecognized JSON structure.")

# === Convert to DataFrame ===
df = pd.json_normalize(jobs)
# For all numeric columns, fill NaN/None with 0
for col in df.select_dtypes(include='number').columns:
    df[col] = df[col].fillna(0)

# For all object (string) columns, fill NaN/None with empty string
for col in df.select_dtypes(include='object').columns:
    df[col] = df[col].fillna("")
# === Preview the structure (optional, for dev only) ===
# print(f"Loaded {len(df)} job records")
# print(df.columns.tolist())  # Optional: See all available columns


#  Critical and High Weighting KPIs

def score_budget_attractiveness(row):
    min_rate = row.get("minHourlyRate")
    if min_rate is None:
        return 0.5  
    if min_rate >= 30:
        return 1.0
    elif 20 <= min_rate < 29:
        return 0.8
    elif 15 <= min_rate < 19:
        return 0.6
    elif 10 <= min_rate < 14:
        return 0.4
    elif 8 <= min_rate < 10:
        return 0.3
    else:
        return 0.0

def score_avg_hourly_rate(row):
    avg_rate = row.get("buyerAvgHourlyRate")
    if avg_rate is None:
        return 0.2
    if avg_rate >= 50:
        return 1.0
    elif 40 <= avg_rate < 50:
        return 0.8
    elif 30 <= avg_rate < 40:
        return 0.6
    elif 20 <= avg_rate < 30:
        return 0.4
    else:
        return 0.2

def score_contract_to_hire(row):
    is_cth = row.get("isContractToHire", False)
    tags = row.get("tags", [])
    if is_cth or ("contractToHireSet" in tags):
        return 1.0
    else:
        return 0.6

def score_enterprise_heuristic(row):
    description = row.get("description", "").lower()
    enterprise_keywords = [
        "fortune 500", "enterprise-grade", "enterprise saas",
        "corporate clients", "serving global teams", "subsidiary of", "multinational"
    ]
    for kw in enterprise_keywords:
        if re.search(rf"\b{re.escape(kw)}\b", description):
            return 1.0
    return 0.5

def score_hiring_rate(row):
    hires = row.get("buyerTotalJobsWithHires")
    posts = row.get("buyerPostedJobsCount")
    if not hires or not posts or posts == 0:
        return 0.2
    hiring_rate = hires / posts
    if hiring_rate >= 0.8:
        return 1.0
    elif hiring_rate >= 0.6:
        return 0.8
    elif hiring_rate >= 0.4:
        return 0.6
    elif hiring_rate >= 0.2:
        return 0.4
    else:
        return 0.2

def score_job_engagement(row):
    weeks = row.get("hourlyWeeks")
    if weeks is None:
        return 0.2
    if weeks >= 12:
        return 1.0
    elif 8 <= weeks < 12:
        return 0.9
    elif 6 <= weeks < 8:
        return 0.8
    elif 4 <= weeks < 6:
        return 0.4
    else:
        return 0.2

def score_job_title_relevance(row):
    title = row.get("title", "").lower()
    keywords = ["developer", "engineer", "qa", "ai", "ml", "frontend", "backend", "full-stack", "react", "node", "python"]
    match_count = sum(1 for kw in keywords if kw in title)
    if match_count >= 2:
        return 1.0
    elif match_count == 1:
        return 0.6
    else:
        return 0.3

def score_client_tenure(row):
    date_str = row.get("companyContractDate")
    if not date_str:
        return 0.6
    contract_date = datetime.fromisoformat(date_str.replace("Z", ""))
    months_active = (datetime.utcnow() - contract_date).days / 30
    if months_active > 12:
        return 1.0
    elif 6 <= months_active <= 12:
        return 0.8
    else:
        return 0.6

def score_client_hiring_history(row):
    total_assignments = row.get("buyerTotalAssignments", 0)
    total_jobs_with_hires = row.get("buyerTotalJobsWithHires", 0)
    total_hires = max(total_assignments, total_jobs_with_hires)

    if total_hires >= 10:
        return 1.0
    elif 7 <= total_hires < 10:
        return 0.8
    elif 4 <= total_hires < 7:
        return 0.6
    elif 1 <= total_hires < 4:
        return 0.4
    else:
        return 0.2

def score_active_assignments(row):
    count = row.get("buyerActiveAssignmentsCount", 0)
    if count >= 3:
        return 1.0
    elif 1 <= count < 3:
        return 0.8
    else:
        return 0.5

def score_feedback_volume(row):
    count = row.get("buyerFeedbackCount", 0)
    if count >= 10:
        return 1.0
    elif 7 <= count <= 9:
        return 0.8
    elif 4 <= count <= 6:
        return 0.6
    elif 1 <= count <= 3:
        return 0.4
    else:
        return 0.2

def score_open_jobs(row):
    count = row.get("buyerOpenJobsCount", 0)
    if count > 3:
        return 1.0
    elif 1 <= count <= 3:
        return 0.8
    else:
        return 0.6

def score_skill_match(row, your_skills=None):
    if your_skills is None:
        your_skills = {
            "Java", "Spring Boot", "React", "Python", "AI", "Machine Learning", "RESTful API",
            "API Integration", "PostgreSQL", "Node.js", "Docker", "Kubernetes"
        }
    job_skills = set(row.get("skills", []))
    match_count = len(job_skills.intersection(your_skills))

    if match_count >= 5:
        return 1.0
    elif match_count == 4:
        return 0.8
    elif 2 <= match_count <= 3:
        return 0.6
    elif match_count == 1:
        return 0.4
    else:
        return 0.2

def score_weekly_hours(row, your_availability=40):
    min_hours = row.get("minHoursWeek")
    if min_hours is None:
        return 0.3
    diff = your_availability - min_hours
    if diff >= 0:
        return 1.0
    elif diff >= -10:
        return 0.8
    elif diff >= -20:
        return 0.6
    else:
        return 0.3

def score_client_rating(row):
    score = row.get("buyerScore")
    if score is None:
        return 0.2  # Default to low score if not available
    if score >= 4.7:
        return 1.0
    elif 4.5 <= score < 4.7:
        return 0.8
    elif 4.3 <= score < 4.5:
        return 0.7
    elif 4.0 <= score < 4.3:
        return 0.6
    elif 3.7 <= score < 4.0:
        return 0.5
    else:
        return 0.3

def score_client_activity_recency(row):
    last_activity_str = row.get("lastBuyerActivity")
    if not last_activity_str:
        return 0.2  # No activity info

    try:
        last_activity = pd.to_datetime(last_activity_str)
        days_ago = (pd.Timestamp.now(tz="UTC") - last_activity).days
    except Exception:
        return 0.2

    if days_ago <= 1:
        return 1.0
    elif days_ago == 2:
        return 0.8
    elif days_ago == 3:
        return 0.6
    elif days_ago == 4:
        return 0.5
    elif days_ago == 5:
        return 0.4
    else:
        return 0.2
    
def score_payment_verification(row):
    if row.get("isPaymentMethodVerified") is True:
        return 1.0
    return 0.2

# def score_job_level_match(row, user_level="EXPERT"):
#     job_level = row.get("level", "").lower()
#     contractor_tier = row.get("contractorTier", "").lower()
#     user_level = user_level.lower()

#     if contractor_tier == user_level:
#         return 1.0
#     elif job_level.startswith("intermediate") or contractor_tier.startswith("intermediate"):
#         return 0.8
#     elif job_level.startswith("entry") or contractor_tier.startswith("entry"):
#         return 0.6
#     else:
#         return 0.7  # fallback for unknown formats
def score_job_level_match(row, user_level="EXPERT"):
    job_level = str(row.get("level", "")).lower()
    contractor_tier = str(row.get("contractorTier", "")).lower()
    user_level = user_level.lower()

    if contractor_tier == user_level:
        return 1.0
    elif job_level.startswith("intermediate") or contractor_tier.startswith("intermediate"):
        return 0.8
    elif job_level.startswith("entry") or contractor_tier.startswith("entry"):
        return 0.6
    else:
        return 0.7  # fallback for unknown formats


# Apply the KPI functions and store scores
df["kpi_budget_attractiveness"] = df.apply(score_budget_attractiveness, axis=1)
df["kpi_avg_hourly_rate"] = df.apply(score_avg_hourly_rate, axis=1)
df["kpi_contract_to_hire"] = df.apply(score_contract_to_hire, axis=1)
df["kpi_enterprise_heuristic"] = df.apply(score_enterprise_heuristic, axis=1)
df["kpi_hiring_rate"] = df.apply(score_hiring_rate, axis=1)
df["kpi_job_engagement"] = df.apply(score_job_engagement, axis=1)
df["kpi_job_title_relevance"] = df.apply(score_job_title_relevance, axis=1)
df["kpi_client_tenure"] = df.apply(score_client_tenure, axis=1)
df["kpi_client_hiring_history"] = df.apply(score_client_hiring_history, axis=1)
df["kpi_client_active_assignments"] = df.apply(score_active_assignments, axis=1)
df["kpi_client_feedback_volume"] = df.apply(score_feedback_volume, axis=1)
df["kpi_client_open_jobs"] = df.apply(score_open_jobs, axis=1)
df["kpi_skill_match"] = df.apply(score_skill_match, axis=1)
df["kpi_weekly_hour_commitment"] = df.apply(score_weekly_hours, axis=1)
df["kpi_client_rating"] = df.apply(score_client_rating, axis=1)
df["kpi_client_activity_recency"] = df.apply(score_client_activity_recency, axis=1)
df["kpi_payment_verification"] = df.apply(score_payment_verification, axis=1)
df["kpi_job_level_match"] = df.apply(score_job_level_match, axis=1)


# Define KPI columns
kpi_columns = [
    "kpi_budget_attractiveness",           # Critical
    "kpi_avg_hourly_rate",                 # High
    "kpi_contract_to_hire",                # Critical if green
    "kpi_enterprise_heuristic",            # Critical if green
    "kpi_hiring_rate",                     # High
    "kpi_job_engagement",
    "kpi_job_title_relevance",
    "kpi_client_tenure",
    "kpi_client_hiring_history",
    "kpi_client_active_assignments",
    "kpi_client_feedback_volume",
    "kpi_client_open_jobs",
    "kpi_skill_match",
    "kpi_weekly_hour_commitment",
    "kpi_client_rating",
    "kpi_client_activity_recency",
    "kpi_payment_verification",
    "kpi_job_level_match"
]

# Assign weights
weights = {
    "kpi_budget_attractiveness": 2.0,         # Critical
    "kpi_avg_hourly_rate": 1.5,              # High
    "kpi_contract_to_hire": 1.5,             # Critical if green
    "kpi_enterprise_heuristic": 2.0,         # Critical if green
    "kpi_hiring_rate": 1.5,                  # High
}

# Default weight for non-specified KPIs
default_weight = 1.0

def calculate_weighted_score(row):
    total_score = 0
    total_weight = 0
    for col in kpi_columns:
        # Dynamic weight assignment
        if col == "kpi_contract_to_hire":
            weight = 1.5 if row[col] == 1.0 else 1.0
        elif col == "kpi_enterprise_heuristic":
            weight = 2.0 if row[col] == 1.0 else 1.0
        else:
            weight = weights.get(col, default_weight)

        score = row[col] if pd.notnull(row[col]) else 0
        total_score += score * weight
        total_weight += weight
    return round(total_score / total_weight, 3) if total_weight > 0 else 0


df["final_weighted_score"] = df.apply(calculate_weighted_score, axis=1)

def assign_tier(score):
    if score >= 0.7:
        return "Green"
    elif score >= 0.4:
        return "Yellow"
    else:
        return "Red"

df["tier"] = df["final_weighted_score"].apply(assign_tier)


# Reattach scores to original JSON objects
# Convert back to enriched job objects
enriched_jobs = []
for idx, job in enumerate(jobs):
    enriched = job.copy()
    for kpi in kpi_columns:
        enriched[kpi] = df.loc[idx, kpi]
    enriched["final_weighted_score"] = df.loc[idx, "final_weighted_score"]
    enriched["tier"] = df.loc[idx, "tier"]
    enriched_jobs.append(enriched)

# --- AI REMARK GENERATION ---
# print("\n>> Generating AI Remarks using RAG...")
enriched_jobs = generate_ai_remark(enriched_jobs)
# print(">> AI Remarks generation completed.")

# Save to final output file
output_path = os.path.join(base_dir, "..", "data", "final_jobs_upwork.json")

with open(output_path, 'w', encoding='utf-8') as f: 
    json.dump(enriched_jobs, f, indent=2, ensure_ascii=False)

# print(f"\nFinal output written to: {output_path}")



# # Let's assume we're triggering this from the front-end or logic
# job = {
#     "title": "Build a High-Converting Shopify Site for a Premium Coffee Subscription Brand",
#     "descriptionText": "We’re launching Longshot — a next-gen coffee brand built for people who want wellness and performance without the “supplement” vibe.\n\nIt’s a lifestyle subscription brand, and the website needs to reflect that — clean, premium, bold, and conversion-focused.\n\n⸻\n\n✅ What We Need:\n\t1.\tShopify Website Setup\n\t•\tHome page, Product page (with subscription), FAQ, About, Contact\n\t•\tFast, responsive, mobile-optimised\n\t•\tLight customisation of a Shopify theme (we can purchase one if needed)\n\n\t2.\tRecharge Subscription Integration\n\t•\tMonthly subscription with ability to manage customer accounts\n\t•\tSeamless checkout and subscriber flow\n\n\t3.\tConversion-Driven Layout\n\t•\tIncorporate UGC, reviews, icons, benefits\n\t•\tSticky CTA buttons, simple nav, mobile-first layout\n\t•\tTrust-building elements (badges, customer promises)\n\n\t4.\tFigma Designs First\n\t•\tWe want clear wireframes and Figma mockups before development begins\n\t•\tEnsure brand identity and tone are locked in\n\n⸻\n\n📦 We’ll Provide:\n\t•\tBrand colours\n\t•\tCopy for each section (or we’ll collaborate)\n\t•\tInspiration websites."
# }

# # Real-time selected category (e.g., from dropdown)
# selected_category = "Software Development"

# # Generate draft
# draft = generate_upwork_proposal(job, selected_category)

# # Output the draft (or pass to frontend)
# print(draft)
