from uuid import uuid4
from tqdm import tqdm
from config import pinecone_client, PINECONE_ENV
from pinecone import ServerlessSpec
from python.utils.get_embedding import get_embedding

CHUNK_SIZE = 300  # characters

def chunk_text(text, chunk_size=CHUNK_SIZE):
    paragraphs = text.split("\n")
    chunks, current_chunk = [], ""
    for para in paragraphs:
        if len(current_chunk) + len(para) <= chunk_size:
            current_chunk += para + "\n"
        else:
            chunks.append(current_chunk.strip())
            current_chunk = para + "\n"
    if current_chunk:
        chunks.append(current_chunk.strip())
    return chunks

# --- Combine all product & service documents ---
all_docs = []

# Products
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
for doc in product_docs:
    for chunk in chunk_text(doc["content"]):
        all_docs.append({
            "source_id": doc["id"],
            "source_name": doc["name"],
            "source_type": "product",
            "chunk": chunk
        })

# Services
service_docs = [
    {
        "id": "software-dev",
        "name": "Software Development",
        "content": """We craft custom software solutions tailored to your business needs, including:

● Full-stack Development (MERN, MEAN, etc.)
● Front-end Development (React, Angular, Vue)
● Back-end Development (Node.js, Python, Java)
● Mobile App Development (iOS/Android/Cross-platform)
● Enterprise Application Development
● Cloud-based Software Solutions
● Digital Transformation Services"""
    },
    {
        "id": "qa",
        "name": "QA & Test Automation",
        "content": """Ensuring the quality and reliability of your software through:

● Functional Testing
● Test Automation (Selenium, Cypress, etc.)
● Security Testing
● Performance Testing
● Continuous Testing in CI/CD pipelines
● QA Process Consulting"""
    },
    {
        "id": "aiml",
        "name": "AI/ML & Generative AI",
        "content": """Building intelligent solutions powered by:

● Machine Learning Models
● Generative AI Solutions
● Natural Language Processing
● Computer Vision
● Predictive Analytics
● AI Integration Services"""
    },
    {
        "id": "uiux",
        "name": "UI/UX Designing",
        "content": """Creating intuitive and engaging user experiences with services like:

● UX Research & Strategy
● User Interface Design
● Prototyping & Wireframing
● Responsive Design
● User Testing
● Design Systems Development"""
    },
    {
        "id": "devops",
        "name": "DevOps & Cloud Engineering",
        "content": """Optimizing your development and deployment processes through:

● Process Automation
● CI/CD Pipeline Implementation
● Infrastructure as Code (IaC)
● Cloud Migration & Optimization
● Containerization & Orchestration
● Serverless Architecture
● Monitoring & Observability"""
    },
    {
        "id": "cybersecurity",
        "name": "Cybersecurity",
        "content": """Protecting your digital assets with services such as:

● Threat Detection & Prevention
● Penetration Testing
● Vulnerability Assessment
● Security Audits & Compliance
● Incident Response
● Security Awareness Training"""
    }
]
for doc in service_docs:
    for chunk in chunk_text(doc["content"]):
        all_docs.append({
            "source_id": doc["id"],
            "source_name": doc["name"],
            "source_type": "service",
            "chunk": chunk
        })

# --- Upload to Pinecone ---
INDEX_NAME = "services-index"
if INDEX_NAME not in pinecone_client.list_indexes().names():
    pinecone_client.create_index(
        name=INDEX_NAME,
        dimension=1536,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region=PINECONE_ENV)
    )

index = pinecone_client.Index(INDEX_NAME)

for doc in tqdm(all_docs, desc=f"Uploading chunks to {INDEX_NAME}"):
    embedding = get_embedding(doc["chunk"])
    index.upsert([
        (
            str(uuid4()),
            embedding,
            {
                "source_id": doc["source_id"],
                "source_name": doc["source_name"],
                "source_type": doc["source_type"],
                "content": doc["chunk"]
            }
        )
    ])

print("All service and product chunks uploaded to Pinecone.")
