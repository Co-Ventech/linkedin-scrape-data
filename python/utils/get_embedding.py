from config import openai_client

def get_embedding(text: str, model="text-embedding-ada-002") -> list:
    text = text.replace("\n", " ")
    response = openai_client.embeddings.create(
        input=[text],
        model=model
    )
    return response.data[0].embedding

