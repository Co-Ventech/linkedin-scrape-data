import pandas as pd
import json

# Sample job data (you can replace this with your actual data)
job_data = {
    "jobId": "1945895473771996881",
    "title": "Core Web Vitals Optimization Specialist",
    "description": "We are seeking an experienced professional to help improve our website's Core Web Vitals. Your expertise will ensure our site meets performance benchmarks, enhances user experience, and boosts SEO rankings. You will analyze current metrics, identify key areas for improvement, and implement effective solutions. A strong understanding of web performance is essential. If you are passionate about optimizing user experience and have a proven track record in this area, we would love to hear from you!",
    "isContractToHire": False,
    "isPaymentMethodVerified": True,
    "level": "IntermediateLevel",
    "contractorTier": "INTERMEDIATE",
    "companyId": "669740907931598848",
    "companyIndustry": None,
    "companyContractDate": "2015-11-26T00:00:00.000Z",
    "buyerScore": 4.91,
    "buyerTotalAssignments": 193,
    "buyerTotalJobsWithHires": 168,
    "buyerActiveAssignmentsCount": 53,
    "buyerFeedbackCount": 74,
    "buyerOpenJobsCount": 3,
    "buyerPostedJobsCount": 103,
    "buyerAvgHourlyRate": 22.66733713117627,
    "minHourlyRate": 15,
    "maxHourlyRate": 35,
    "hourlyType": "FULL_TIME",
    "hourlyWeeks": 9,
    "tags": ["jpgV2Generated", "searchable"],
    "skills": ["Search Engine Optimization", "Web Development", "HTML", "Web Design", "WordPress"],
    "minHoursWeek": 40,
    "lastBuyerActivity": "2025-07-17T17:16:48.706Z",
    "city": "san mateo",
    "country": "United States",
    "countryTimezone": "America/Sao_Paulo (UTC-03:00)",
    "utcOffsetMillis": -10800000,
    "companyName": None,
    "companySize": None,
    "companyIsEDCReplicated": None,
    "clientTotalHours": 9157.83,
    "clientTotalSpend": 229788.49,
    "clientRisingTalent": None,
    "category": "Web Development",
    "categoryGroup": "Web, Mobile & Software Dev",
    "occupation": "Full Stack Development",
    "jobType": "HOURLY",
    "fixedBudget": None,
    "fixedDurationLabel": None,
    "numberOfPositionsToHire": 1,
    "premium": False,
    "openJobs": [
        {
            "ciphertext": "~021944066025694923368",
            "id": "1944066025694923368",
            "isPtcPrivate": False,
            "title": "Quality Assurance Tester (US Time Availability Required)",
            "type": "HOURLY"
        },
        {
            "ciphertext": "~021937999150324653761",
            "id": "1937999150324653761",
            "isPtcPrivate": False,
            "title": "Video Creative Editor and Director for Advertising Projects",
            "type": "HOURLY"
        }
    ],
    "questions": [],
    "status": "ACTIVE",
    "url": "https://www.upwork.com/jobs/~021945895473771996881",
    "qualificationsCountries": None,
    "qualificationsLanguages": None,
    "qualificationsMinJobSuccessScore": 0,
    "qualificationsRisingTalent": False,
    "qualificationsLocationCheckRequired": False,
    "ts_create": "2025-07-17T17:16:48.796Z",
    "ts_publish": "2025-07-17T17:16:48.993Z",
    "ts_sourcing": None,
    "kpi_budget_attractiveness": 0.3,
    "kpi_avg_hourly_rate": 0.4,
    "kpi_contract_to_hire": 0.6,
    "kpi_enterprise_heuristic": 0.5,
    "kpi_hiring_rate": 1,
    "kpi_job_engagement": 0.9,
    "kpi_job_title_relevance": 0.3,
    "kpi_client_tenure": 1,
    "kpi_client_hiring_history": 1,
    "kpi_client_active_assignments": 1,
    "kpi_client_feedback_volume": 1,
    "kpi_client_open_jobs": 0.8,
    "kpi_skill_match": 0.2,
    "kpi_weekly_hour_commitment": 1,
    "kpi_client_rating": 1,
    "kpi_client_activity_recency": 1,
    "kpi_payment_verification": 1,
    "kpi_job_level_match": 0.8,
    "final_weighted_score": 0.74,
    "tier": "Green",
    "ai_remark": "This job aligns well with DevOps as it requires expertise in optimizing website performance and enhancing user experience, which are key focuses of DevOps practices."
}

def create_job_excel(job_data, filename="job_data.xlsx"):
    """
    Create an Excel file from job data JSON
    """
    # Flatten the data for Excel export
    flattened_data = {}
    
    for key, value in job_data.items():
        if isinstance(value, list):
            if key == "openJobs":
                # Handle open jobs separately
                for i, job in enumerate(value):
                    for job_key, job_value in job.items():
                        flattened_data[f"openJob_{i+1}_{job_key}"] = job_value
            else:
                # Convert list to comma-separated string
                flattened_data[key] = ", ".join(map(str, value))
        elif isinstance(value, dict):
            # Flatten nested dictionaries
            for nested_key, nested_value in value.items():
                flattened_data[f"{key}_{nested_key}"] = nested_value
        else:
            flattened_data[key] = value
    
    # Create DataFrame
    df = pd.DataFrame([flattened_data])
     
    # Create Excel writer with multiple sheets
    with pd.ExcelWriter(filename, engine='openpyxl') as writer:
        # Main job data sheet
        df.to_excel(writer, sheet_name='Job Details', index=False)
        
        # Create a summary sheet with key information
        summary_data = {
            'Field': [
                'Job ID', 'Job Title', 'Level', 'Job Type', 'Hourly Rate Range',
                'Min Hours/Week', 'Duration (weeks)', 'Location', 'Category',
                'Buyer Score', 'Total Assignments', 'Hiring Rate', 'Status'
            ],
            'Value': [
                job_data.get('jobId', ''),
                job_data.get('title', ''),
                job_data.get('level', ''),
                job_data.get('jobType', ''),
                f"${job_data.get('minHourlyRate', 0)}-${job_data.get('maxHourlyRate', 0)}",
                job_data.get('minHoursWeek', ''),
                job_data.get('hourlyWeeks', ''),
                f"{job_data.get('city', '')}, {job_data.get('country', '')}",
                job_data.get('category', ''),
                job_data.get('buyerScore', ''),
                job_data.get('buyerTotalAssignments', ''),
                f"{job_data.get('buyerTotalJobsWithHires', 0)}/{job_data.get('buyerPostedJobsCount', 0)}",
                job_data.get('status', '')
            ]
        }
        
        summary_df = pd.DataFrame(summary_data)
        summary_df.to_excel(writer, sheet_name='Summary', index=False)
        
        # Skills sheet
        if 'skills' in job_data and job_data['skills']:
            skills_df = pd.DataFrame({
                'Required Skills': job_data['skills']
            })
            skills_df.to_excel(writer, sheet_name='Skills', index=False)
        
        # KPI metrics sheet
        kpi_data = {key: value for key, value in job_data.items() if key.startswith('kpi_')}
        if kpi_data:
            kpi_df = pd.DataFrame([kpi_data])
            kpi_df.to_excel(writer, sheet_name='KPI Metrics', index=False)
    
    # print(f"Excel file '{filename}' created successfully!")
    return filename

# Execute the function
if __name__ == "__main__":
    create_job_excel(job_data)
