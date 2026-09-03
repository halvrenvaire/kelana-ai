import boto3
import os
from dotenv import load_dotenv

load_dotenv()

region                   = os.getenv("AWS_REGION", "ap-southeast-2")
KNOWLEDGE_BASE_ID        = os.getenv("KNOWLEDGE_BASE_ID")
MODEL_ID                 = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")

# bedrock-agent-runtime untuk retrieve
agent_runtime = boto3.client(
    "bedrock-agent-runtime",
    region_name=region,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

# bedrock-runtime untuk generate
bedrock_runtime = boto3.client(
    "bedrock-runtime",
    region_name=region,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)


def ask_knowledge_base(question: str) -> dict:
    """
    RAG: Retrieve dari KB lalu generate jawaban dengan Bedrock.
    1. retrieve() — cari dokumen relevan dari KB
    2. converse() — generate jawaban berdasarkan konteks dokumen
    """

    # Step 1: Retrieve konteks dari KB (managed KB pakai managedSearchConfiguration)
    retrieval_response = agent_runtime.retrieve(
        knowledgeBaseId=KNOWLEDGE_BASE_ID,
        retrievalQuery={"text": question},
        retrievalConfiguration={
            "managedSearchConfiguration": {
                "numberOfResults": 3,
            }
        },
    )

    results = retrieval_response.get("retrievalResults", [])

    # Kumpulkan konteks dan sources
    context_parts = []
    sources = []

    for result in results:
        content = result.get("content", {}).get("text", "")
        if content:
            context_parts.append(content)

        # Ambil nama source dokumen
        location = result.get("location", {})
        # Managed KB pakai customDocumentLocation
        custom_loc = location.get("customDocumentLocation", {})
        uri = custom_loc.get("id", "")
        if not uri:
            # fallback ke s3Location
            uri = location.get("s3Location", {}).get("uri", "")
        if uri:
            filename = uri.split("/")[-1]
            if filename and filename not in sources:
                sources.append(filename)

    context = "\n\n".join(context_parts)

    # Step 2: Generate jawaban dengan konteks dari KB
    if context:
        prompt = f"""You are a helpful travel assistant. Answer the question based ONLY on the provided context from travel documents.

Context from travel documents:
{context}

Question: {question}

Answer based on the context above. Be specific and include relevant details like prices, dates, and tips from the documents."""
    else:
        prompt = f"""You are a helpful travel assistant. Answer this travel question:

Question: {question}

Note: No specific documents were found for this question. Provide a general helpful answer."""

    response = bedrock_runtime.converse(
        modelId=MODEL_ID,
        messages=[
            {"role": "user", "content": [{"text": prompt}]}
        ],
    )

    answer = response["output"]["message"]["content"][0]["text"]

    return {
        "answer": answer,
        "sources": sources,
    }
