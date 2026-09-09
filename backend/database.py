from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# load .env supaya os.getenv() bisa membacanya
load_dotenv()

# connection string dari .env — jangan pernah hardcode secret
DATABASE_URL = os.getenv("DATABASE_URL")

# engine = kolam koneksi ke database
# Add pool settings for better connection management with Neon
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Verify connections before using them
    pool_recycle=300,     # Recycle connections after 5 minutes
    pool_size=5,          # Maximum number of connections
    max_overflow=10,      # Allow up to 10 extra connections
    connect_args={
        "connect_timeout": 10,
        "options": "-c timezone=utc"
    }
)

# SessionLocal = pabrik pembuat sesi database
SessionLocal = sessionmaker(bind=engine, autoflush=False)

# Base = semua model ORM mewarisi dari ini
Base = declarative_base()


def init_db() -> None:
    """Membuat semua tabel SQLAlchemy untuk database yang dikonfigurasi."""
    Base.metadata.create_all(bind=engine)
