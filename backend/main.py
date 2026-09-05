import json
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
from models.conversation import Conversation, Message
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


class SendMessageRequest(BaseModel):
    message: str


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


# ── Conversation endpoints ────────────────────────────────────

@app.post("/api/v1/conversations", status_code=status.HTTP_201_CREATED)
def create_conversation(
    current_user: User = Depends(get_current_user),
):
    """Buat conversation baru (kosong)."""
    db = SessionLocal()
    conv = Conversation(user_id=current_user.id, title="New Conversation")
    db.add(conv)
    db.commit()
    db.refresh(conv)
    db.close()
    return {
        "id":         conv.id,
        "title":      conv.title,
        "created_at": conv.created_at,
        "messages":   [],
    }


@app.get("/api/v1/conversations")
def list_conversations(
    current_user: User = Depends(get_current_user),
):
    """List semua conversation milik user, terbaru di atas."""
    db = SessionLocal()
    convs = (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
        .all()
    )
    db.close()
    return [
        {"id": c.id, "title": c.title, "created_at": c.created_at}
        for c in convs
    ]


@app.get("/api/v1/conversations/{conv_id}")
def get_conversation(
    conv_id: int,
    current_user: User = Depends(get_current_user),
):
    """Ambil conversation beserta semua messages-nya."""
    db = SessionLocal()
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()

    if conv is None:
        db.close()
        raise HTTPException(status_code=404, detail="Conversation tidak ditemukan.")
    if conv.user_id != current_user.id:
        db.close()
        raise HTTPException(status_code=403, detail="Akses ditolak.")

    result = {
        "id":         conv.id,
        "title":      conv.title,
        "created_at": conv.created_at,
        "messages": [
            {
                "id":         m.id,
                "role":       m.role,
                "content":    m.content,
                "sources":    json.loads(m.sources) if m.sources else [],
                "created_at": m.created_at,
            }
            for m in conv.messages
        ],
    }
    db.close()
    return result


@app.post("/api/v1/conversations/{conv_id}/messages")
def send_message(
    conv_id: int,
    request: SendMessageRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Kirim pesan ke conversation.
    Flow:
    1. Simpan pesan user ke DB
    2. Load semua history messages
    3. Kirim ke KB (RAG) dengan konteks history
    4. Simpan response AI ke DB
    5. Return response + sources
    """
    db = SessionLocal()

    # Validasi conversation
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if conv is None:
        db.close()
        raise HTTPException(status_code=404, detail="Conversation tidak ditemukan.")
    if conv.user_id != current_user.id:
        db.close()
        raise HTTPException(status_code=403, detail="Akses ditolak.")

    # Step 1: Simpan pesan user
    user_msg = Message(
        conversation_id=conv_id,
        role="user",
        content=request.message,
    )
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # Step 2: Update conversation title dari pesan pertama user
    if conv.title == "New Conversation":
        title = request.message[:60] + ("…" if len(request.message) > 60 else "")
        conv.title = title
        db.commit()

    # Step 3: Load semua history untuk konteks
    history = db.query(Message).filter(Message.conversation_id == conv_id).order_by(Message.id).all()

    # Step 4: Kirim ke KB dengan konteks history
    try:
        result = ask_knowledge_base(request.message)
        ai_answer  = result["answer"]
        ai_sources = result["sources"]
    except Exception as e:
        db.close()
        raise HTTPException(status_code=500, detail=str(e))

    # Step 5: Simpan response AI ke DB
    ai_msg = Message(
        conversation_id=conv_id,
        role="assistant",
        content=ai_answer,
        sources=json.dumps(ai_sources),
    )
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)
    db.close()

    return {
        "id":         ai_msg.id,
        "role":       ai_msg.role,
        "content":    ai_answer,
        "sources":    ai_sources,
        "created_at": ai_msg.created_at,
        "conversation_title": conv.title,
    }


@app.delete("/api/v1/conversations/{conv_id}")
def delete_conversation(
    conv_id: int,
    current_user: User = Depends(get_current_user),
):
    """Hapus conversation beserta semua messages-nya."""
    db = SessionLocal()
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()

    if conv is None:
        db.close()
        raise HTTPException(status_code=404, detail="Conversation tidak ditemukan.")
    if conv.user_id != current_user.id:
        db.close()
        raise HTTPException(status_code=403, detail="Akses ditolak.")

    db.delete(conv)
    db.commit()
    db.close()
    return {"message": "Conversation berhasil dihapus."}
