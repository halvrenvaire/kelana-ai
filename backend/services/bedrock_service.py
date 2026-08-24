import os
import boto3
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------

AWS_BEARER_TOKEN_BEDROCK: str | None = os.getenv("AWS_BEARER_TOKEN_BEDROCK")
AWS_REGION: str = os.getenv("AWS_REGION", "ap-southeast-2")
MODEL_ID: str = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")

TRAVEL_PLANNER_PROMPT = (
    "You are an experienced travel planner.\n"
    "Plan a {days}-day itinerary for {destination}.\n"
    "Budget: USD {budget}\n"
    "Travel Style: {travel_style}\n"
    "\n"
    "For EACH day, structure the plan into exactly three sections:\n"
    "\n"
    "Morning:\n"
    "- Provide 2-3 specific morning activities.\n"
    "\n"
    "Afternoon:\n"
    "- Recommend cultural sites and local experiences.\n"
    "\n"
    "Evening:\n"
    "- Suggest dinner spots and nightlife options.\n"
    "\n"
    "Format each day exactly like this:\n"
    "Day X: [Theme of the day]\n"
    "Morning:\n"
    "- activity 1\n"
    "- activity 2\n"
    "Afternoon:\n"
    "- activity 1\n"
    "- activity 2\n"
    "Evening:\n"
    "- activity 1\n"
    "- activity 2\n"
)

# Create the Bedrock Runtime client
# boto3 automatically authenticates using AWS_BEARER_TOKEN_BEDROCK
client = boto3.client(
    service_name="bedrock-runtime",
    region_name=AWS_REGION,
)


def generate_recommendation(destination: str, days: int, budget: float, travel_style: str = "balanced") -> str:
    """Meminta Amazon Bedrock membuat itinerary perjalanan."""

    prompt = TRAVEL_PLANNER_PROMPT.format(
        days=days,
        destination=destination,
        budget=budget,
        travel_style=travel_style,
    )

    response = client.converse(
        modelId=MODEL_ID,
        messages=[
            {
                "role": "user",
                "content": [{"text": prompt}],
            }
        ],
    )

    return response["output"]["message"]["content"][0]["text"]
