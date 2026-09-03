import boto3
import os
from dotenv import load_dotenv

load_dotenv()

# ── AWS config ────────────────────────────────────────────────
region                   = os.getenv("AWS_REGION", "ap-southeast-2")
KNOWLEDGE_BASE_ID        = os.getenv("KNOWLEDGE_BASE_ID")
KNOWLEDGE_BASE_MODEL_ARN = os.getenv(
    "KNOWLEDGE_BASE_MODEL_ARN",
    "arn:aws:bedrock:ap-southeast-2::foundation-model/amazon.nova-lite-v1:0",
)

# bedrock-agent-runtime untuk RetrieveAndGenerate
client = boto3.client(
    "bedrock-agent-runtime",
    region_name=region,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)


def ask_knowledge_base(question: str) -> dict:
    """
    Kirim pertanyaan ke Bedrock Knowledge Base.
    Bedrock otomatis:
    1. Cari dokumen relevan (retrieval)
    2. Generate jawaban berdasarkan dokumen (grounded generation)
    Return: { answer, source }
    """
    response = client.retrieve_and_generate(
        input={"text": question},
        retrieveAndGenerateConfiguration={
            "type": "KNOWLEDGE_BASE",
            "knowledgeBaseConfiguration": {
                "knowledgeBaseId": KNOWLEDGE_BASE_ID,
                "modelArn": KNOWLEDGE_BASE_MODEL_ARN,
                "retrievalConfiguration": {
                    "vectorSearchConfiguration": {
                        "numberOfResults": 3,
                    }
                },
            },
        },
    )

    answer = response["output"]["text"]

    # Ambil source dokumen jika ada
    citations = response.get("citations", [])
    sources = []
    for citation in citations:
        for ref in citation.get("retrievedReferences", []):
            location = ref.get("location", {})
            s3_loc   = location.get("s3Location", {})
            uri      = s3_loc.get("uri", "")
            if uri:
                # Ambil nama file saja dari URI
                filename = uri.split("/")[-1]
                if filename not in sources:
                    sources.append(filename)

    return {
        "answer": answer,
        "sources": sources,
    }
