
from proposal_generator import generate_linkedin_proposal
from proposal_generator import generate_upwork_proposal



# LINKEDIN

Sample job coming from your LinkedIn scrape
job = {
    "title": "Pharmacist - AI Trainer",
    "descriptionText": "Job Type: Part-time\nLocation: Remote\nJob Summary:Join our customer’s team as a Pharmacist - AI Trainer and play a pivotal role in shaping the accuracy and reliability of AI-powered medical platforms. Leverage your clinical expertise to review, train, and enhance artificial intelligence in delivering high-quality, medically-sound information for healthcare providers and patients.\nKey Responsibilities:Analyze and review AI-generated content related to prescriptions, drug interactions, and patient education for medical accuracy and clarity.Offer expert feedback to optimize AI responses aligned with current pharmaceutical standards and patient safety protocols.Collaborate with interdisciplinary teams to design training sets based on real-world pharmacy scenarios and best practices.Advise on medication selection, proper dosage, contraindications, and emerging pharmaceutical therapies to ensure comprehensive AI solutions.Contribute to continuous improvement by identifying gaps in AI knowledge and suggesting targeted educational content.Ensure all AI outputs adhere strictly to regulatory, ethical, and privacy guidelines in pharmacy practice.Communicate complex pharmacy concepts clearly through both written reports and virtual team discussions.\nRequired Skills and Qualifications:Active pharmacist license in good standing with substantial experience in drug dispensing and patient counseling.Thorough understanding of drug interactions, contraindications, side effects, and evidence-based medication use.Demonstrated excellence in both written and verbal communication, with a strong attention to detail.Experience advising physicians and collaborating with multidisciplinary medical teams.Keen interest in medical technology, clinical decision support, and AI solutions in healthcare.High standards for accuracy, ethics, and patient safety in all professional undertakings.Self-motivated, reliable, and comfortable working independently in a remote, part-time setting.\nPreferred Qualifications:Prior experience in AI training, healthcare informatics, or pharmacy-related software development.Advanced degree or certifications in clinical pharmacy, informatics, or a related field.Familiarity with regulatory requirements governing digital health and data privacy."
}

# Example category from frontend dropdown
selected_category = "AI/ML"
is_product = False  # True if user selected Recruitinn, SkillBuilder, etc.

# Generate the proposal
linkedin_pitch = generate_linkedin_proposal(job, selected_category, is_product)

# Output to terminal / frontend
# print("\n--- LinkedIn Pitch Draft ---\n")
# print(linkedin_pitch)



# UPWORK

# Let's assume we're triggering this from the front-end or logic
job = {
    "title": "Build a High-Converting Shopify Site for a Premium Coffee Subscription Brand",
    "descriptionText": "We’re launching Longshot — a next-gen coffee brand built for people who want wellness and performance without the “supplement” vibe.\n\nIt’s a lifestyle subscription brand, and the website needs to reflect that — clean, premium, bold, and conversion-focused.\n\n⸻\n\n✅ What We Need:\n\t1.\tShopify Website Setup\n\t•\tHome page, Product page (with subscription), FAQ, About, Contact\n\t•\tFast, responsive, mobile-optimised\n\t•\tLight customisation of a Shopify theme (we can purchase one if needed)\n\n\t2.\tRecharge Subscription Integration\n\t•\tMonthly subscription with ability to manage customer accounts\n\t•\tSeamless checkout and subscriber flow\n\n\t3.\tConversion-Driven Layout\n\t•\tIncorporate UGC, reviews, icons, benefits\n\t•\tSticky CTA buttons, simple nav, mobile-first layout\n\t•\tTrust-building elements (badges, customer promises)\n\n\t4.\tFigma Designs First\n\t•\tWe want clear wireframes and Figma mockups before development begins\n\t•\tEnsure brand identity and tone are locked in\n\n⸻\n\n📦 We’ll Provide:\n\t•\tBrand colours\n\t•\tCopy for each section (or we’ll collaborate)\n\t•\tInspiration websites."
}

# Real-time selected category (e.g., from dropdown)
selected_category = "Software Development"

# Generate draft
draft = generate_upwork_proposal(job, selected_category)

# Output the draft (or pass to frontend)
# print(draft)
