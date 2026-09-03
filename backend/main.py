from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field, EmailStr
from services.bedrock_service import generate_recommendation
from services.kb_service import ask_knowledge_base
from services.trip_service import calculate_daily_budget, get_trip_category
from services.auth_service import (
    hash_password, verify_password,
    create_access_token, decode_access_token,
)
from models.user import User
from models.trip import Trip
from database import SessionLocal, init_db

app = FastAPI(title="KelanaAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# ── Pydantic schemas ──────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6)


class TripRequest(BaseModel):
    destination: str
    days: int   = Field(gt=0)
    budget: float = Field(gt=0)
    travel_style: str = "balanced"


class QuestionRequest(BaseModel):
    question: str


# ── Auth dependency ───────────────────────────────────────────

def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak valid atau sudah kadaluarsa.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id: int = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token tidak valid.")

    db = SessionLocal()
    user = db.query(User).filter(User.id == int(user_id)).first()
    db.close()

    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User tidak ditemukan.")
    return user


# ── Public endpoints ──────────────────────────────────────────

@app.get("/")
def read_root():
    return {"message": "Welcome to KelanaAI"}


@app.get("/health")
def health_check():
    return {"status": "OK"}


# ── Knowledge Base endpoint ───────────────────────────────────

@app.post("/api/v1/ask")
def ask_endpoint(
    request: QuestionRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Kirim pertanyaan ke Bedrock Knowledge Base (RAG).
    Return jawaban yang grounded dari dokumen travel.
    """
    try:
        result = ask_knowledge_base(request.question)
        return {
            "question": request.question,
            "answer":   result["answer"],
            "sources":  result["sources"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Auth endpoints ────────────────────────────────────────────

@app.post("/api/v1/auth/register", status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest):
    db = SessionLocal()

    if db.query(User).filter(User.email == request.email).first():
        db.close()
        raise HTTPException(status_code=400, detail="Email sudah terdaftar.")

    if db.query(User).filter(User.username == request.username).first():
        db.close()
        raise HTTPException(status_code=400, detail="Username sudah dipakai.")

    user = User(
        email=request.email,
        username=request.username,
        hashed_password=hash_password(request.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()

    token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "username": user.username},
    }


@app.post("/api/v1/auth/login")
def login(form: OAuth2PasswordRequestForm = Depends()):
    db = SessionLocal()
    # username field bisa diisi email atau username
    user = (
        db.query(User).filter(User.email == form.username).first()
        or db.query(User).filter(User.username == form.username).first()
    )
    db.close()

    if user is None or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email/username atau password salah.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "username": user.username},
    }


@app.get("/api/v1/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
    }


# ── Trip endpoints (protected) ────────────────────────────────

@app.post("/api/v1/trips")
def create_trip(
    request: TripRequest,
    current_user: User = Depends(get_current_user),
):
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category     = get_trip_category(request.budget)

    trip = Trip(
        user_id=current_user.id,
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        category=category,
        daily_budget=daily_budget,
        travel_style=request.travel_style,
    )

    db = SessionLocal()
    db.add(trip)
    db.commit()
    db.refresh(trip)
    db.close()
    return trip


@app.get("/api/v1/trips")
def list_trips(current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    trips = db.query(Trip).filter(Trip.user_id == current_user.id).all()
    db.close()
    return trips


@app.get("/api/v1/trips/{trip_id}")
def get_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    db.close()

    if trip is None:
        raise HTTPException(status_code=404, detail="Trip tidak ditemukan.")
    if trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Akses ditolak.")
    return trip


@app.put("/api/v1/trips/{trip_id}")
def update_trip(
    trip_id: int,
    request: TripRequest,
    current_user: User = Depends(get_current_user),
):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail="Trip tidak ditemukan.")
    if trip.user_id != current_user.id:
        db.close()
        raise HTTPException(status_code=403, detail="Akses ditolak.")

    trip.destination  = request.destination
    trip.days         = request.days
    trip.budget       = request.budget
    trip.travel_style = request.travel_style
    trip.category     = get_trip_category(request.budget)
    trip.daily_budget = calculate_daily_budget(request.budget, request.days)

    db.commit()
    db.refresh(trip)
    db.close()
    return trip


@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail="Trip tidak ditemukan.")
    if trip.user_id != current_user.id:
        db.close()
        raise HTTPException(status_code=403, detail="Akses ditolak.")

    db.delete(trip)
    db.commit()
    db.close()
    return {"message": "Trip berhasil dihapus."}


@app.post("/api/v1/trips/{trip_id}/generate")
def generate_trip_recommendation(
    trip_id: int,
    current_user: User = Depends(get_current_user),
):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail="Trip tidak ditemukan.")
    if trip.user_id != current_user.id:
        db.close()
        raise HTTPException(status_code=403, detail="Akses ditolak.")

    recommendation = generate_recommendation(
        destination=trip.destination,
        days=trip.days,
        budget=trip.budget,
        travel_style=trip.travel_style or "balanced",
    )

    trip.ai_recommendation = recommendation
    db.commit()
    db.refresh(trip)
    db.close()
    return trip
