from fastapi import FastAPI
from pydantic import BaseModel, Field

from services.trip_service import calculate_daily_budget, get_trip_category

app = FastAPI()


class TripRequest(BaseModel):
    destination: str
    days: int = Field(gt=0)
    budget: float = Field(gt=0)


@app.get("/")
def read_root():
    return {"message": "Welcome to KelanaAI"}


@app.get("/health")
def health_check():
    return {"status": "OK"}


@app.post("/api/v1/trips")
def create_trip(request: TripRequest):
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)

    return {
        "destination": request.destination,
        "days": request.days,
        "budget": request.budget,
        "daily_budget": daily_budget,
        "category": category,
    }