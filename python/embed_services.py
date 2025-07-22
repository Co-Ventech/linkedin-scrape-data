import json
from uuid import uuid4
from tqdm import tqdm
from config import pinecone_client, PINECONE_ENV
from pinecone import ServerlessSpec
from utils import get_embedding

# --- Co-Ventech Services and Product Descriptions ---

product_docs = [
    {
        "id": "recruitinn",
        "name": "Recruitinn - AI-Powered Recruitment Platform",
        "content": """Recruitinn revolutionizes the hiring process with AI-driven solutions. It enables businesses to 
discover, assess, and onboard top talent efficiently. Key features include:

● AI-based candidate screening
● Automated interview scheduling
● Real-time analytics and reporting
● Seamless integration with existing HR systems"""
    },
    {
        "id": "skillbuilder",
        "name": "SkillBuilder - Learning & Career Development Platform",
        "content": """SkillBuilder offers a holistic approach to professional development, providing:

● Curated courses across various domains
● Recorded sessions for flexible learning
● Live sessions with industry experts
● AI-based career counseling to guide career paths"""
    },
    {
        "id": "co-vental",
        "name": "Co-Vental - AI-Driven Staff Augmentation",
        "content": """Co-Vental streamlines the process of connecting businesses with top-tier freelancers through:

● AI-based initial interviews to assess technical skills
● Subsequent human interviews for comprehensive evaluation
● Inclusion in a vetted talent pool
● Client interviews to ensure the perfect match"""
    }
]

service_docs = [
    {
        "id": "software-dev",
        "name": "Software Development",
        "content": """We craft custom software solutions tailored to your business needs, including:

● Custom Software Development
● App Development
● Enterprise Application Solutions
● Cloud-based Software
● Digital Transformation Services"""
    },
    {
        "id": "qa",
        "name": "QA & Test Automation",
        "content": """Ensuring the quality and reliability of your software through:

● Functional Testing
● Automated Testing
● Security Testing
● Performance Testing
● Continuous Testing in CI/CD pipelines"""
    },
    {
        "id": "uiux",
        "name": "UI/UX Designing",
        "content": """Creating intuitive and engaging user experiences with services like:

● UX Design
● User Interface Design
● Prototyping
● Responsive Design
● User-Centered Design"""
    },
    {
        "id": "devops",
        "name": "DevOps",
        "content": """Optimizing your development processes through:

● Process Automation
● CI/CD Pipeline Implementation
● Cloud DevOps Solutions
● Serverless Architecture
● Scalable Infrastructure"""
    },
    {
        "id": "cybersecurity",
        "name": "Cybersecurity",
        "content": """Protecting your digital assets with services such as:

● Threat Detection
● Penetration Testing
● Vulnerability Assessment
● Security Audits
● Incident Response"""
    }
]

# Upload logic
for name, docs in [("products-index", product_docs), ("services-index", service_docs)]:
    if name not in pinecone_client.list_indexes().names():
        pinecone_client.create_index(
            name=name,
            dimension=1536,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region=PINECONE_ENV)
        )

    index = pinecone_client.Index(name)
    for doc in tqdm(docs, desc=f"Uploading to {name}"):
        embedding = get_embedding(doc["content"])
        index.upsert([
            (str(uuid4()), embedding, {"service_id": doc["id"], "service_name": doc["name"]})
        ])

print("All embeddings uploaded to Pinecone.")

