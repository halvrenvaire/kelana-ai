from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# load .env supaya os.getenv() bisa membacanya
load_dotenv()

# connection string dari .env — jangan pernah hardcode secret
DATABASE_URL = os.getenv("DATABASE_URL")

# engine = kolam koneksi ke database
engine = create_engine(DATABASE_URL)

# SessionLocal = pabrik pembuat sesi database
SessionLocal = sessionmaker(bind=engine, autoflush=False)

# Base = semua model ORM mewarisi dari ini
Base = declarative_base()


def init_db() -> None:
    """Membuat semua tabel SQLAlchemy untuk database yang dikonfigurasi."""
    Base.metadata.create_all(bind=engine)
