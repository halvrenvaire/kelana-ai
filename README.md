# KelanaAI

**AI Travel Planner** — dibangun bertahap dari script Python sederhana menjadi REST API AI-native dengan PostgreSQL dan Amazon Bedrock.

---

## Tentang Proyek

KelanaAI adalah aplikasi perencana perjalanan yang dikembangkan selama bootcamp MAIN Phase 2. Proyek ini dibangun bertahap tiap sesi, dengan arsitektur berlapis (layered architecture) yang memisahkan business logic, presentation layer, dan persistence layer.

---

## Tech Stack

- **Backend:** Python, FastAPI, Uvicorn
- **Database:** PostgreSQL, SQLAlchemy (ORM)
- **AI:** Amazon Bedrock (model `amazon.nova-lite-v1:0`)
- **Version Control:** Git & GitHub

---

## Struktur Proyek

backend/
├── main.py # FastAPI app — presentation & web layer
├── database.py # Koneksi database (engine, SessionLocal, Base)
├── console_app.py # Versi konsol (sesi 1–2)
├── requirements.txt
├── models/
│ └── trip.py # Definisi tabel trips
└── services/
├── trip_service.py # Business logic (kategori, budget, rekomendasi)
└── bedrock_service.py # Integrasi Amazon Bedrock


---

## Setup & Instalasi

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Konfigurasi Environment

Buat file `.env` di dalam folder `backend/`:

DATABASE_URL=postgresql://postgres:<password>@localhost:5432/kelana_ai
AWS_BEARER_TOKEN_BEDROCK=<token_bedrock_anda>
AWS_REGION=ap-southeast-2
MODEL_ID=amazon.nova-lite-v1:0


> File `.env` tidak di-push ke repositori (lihat `.gitignore`). Setiap environment baru wajib membuat file ini secara manual.

### Setup Database

```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE kelana_ai;
```

Tabel akan dibuat otomatis saat aplikasi pertama kali dijalankan (`init_db()`).

---

## Cara Menjalankan

**REST API (FastAPI):**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```
Dokumentasi interaktif tersedia di `http://localhost:8000/docs`

**Aplikasi Konsol (arsip sesi 1–2):**
```bash
cd backend
python3 console_app.py
```

<<<<<<< HEAD
- v0.1.0 — Trip Summary Generator (aplikasi konsol)
- session-2 — Recommendation Engine (kategori, season, daily budget, rekomendasi tempat) 14 Agustus 23:13
- session-3 — REST API dengan FastAPI, 15 Agustus 03:01
<pre> ## Instalasi ```bash cd backend python3 -m venv venv source venv/bin/activate pip install fastapi uvicorn ``` ## Cara Menjalankan ### REST API (sesi 3) ```bash cd backend source venv/bin/activate uvicorn main:app --reload ``` Buka dokumentasi interaktif di http://localhost:8000/docs ### Aplikasi Konsol (sesi 1–2) ```bash cd backend python3 console_app.py ``` ## API Endpoints | Method | Endpoint | Deskripsi | |---|---|---| | GET | `/` | Pesan sambutan | | GET | `/health` | Health check | | POST | `/api/v1/trips` | Hitung kategori & anggaran harian | ## Contoh Request & Response Request `POST /api/v1/trips`: ```json { "destination": "Japan", "days": 5, "budget": 2000 } ``` Response `200 OK`: ```json { "destination": "Japan", "days": 5, "budget": 2000.0, "daily_budget": 400.0, "category": "Standard" } ``` ## Versi - v0.1.0 — Trip Summary Generator (aplikasi konsol) - session-2 — Recommendation Engine (kategori, season, daily budget) - session-3 — REST API dengan FastAPI </pre>
- session-3.1 — Menambah recommendations dan transportations, 16 Agustus 00:26
- session 4 — memakai database postgres, 21 Agustus 17:30
- session 5 — membuat AI dalam website, 24 Agustus 21:24
=======
---

## API Endpoints

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/` | Pesan sambutan |
| GET | `/health` | Health check |
| POST | `/api/v1/trips` | Buat trip baru (hitung kategori & daily budget, simpan ke DB) |
| GET | `/api/v1/trips` | Ambil semua trip |
| GET | `/api/v1/trips/{id}` | Ambil satu trip berdasarkan ID |
| PUT | `/api/v1/trips/{id}` | Update trip (kategori & daily budget dihitung ulang) |
| DELETE | `/api/v1/trips/{id}` | Hapus trip |
| GET | `/api/v1/recommendations` | Daftar rekomendasi tempat (bisa difilter `?category=`) |
| GET | `/api/v1/transportations` | Daftar moda transportasi |
| POST | `/api/v1/trips/{id}/generate` | Generate itinerary harian via Amazon Bedrock, simpan ke DB |

---

## Contoh Request & Response

**Membuat trip baru** — `POST /api/v1/trips`
```json
{
  "destination": "Japan",
  "days": 5,
  "budget": 2000
}
```

Response `200 OK`:
```json
{
  "id": 1,
  "destination": "Japan",
  "days": 5,
  "budget": 2000.0,
  "daily_budget": 400.0,
  "category": "Standard"
}
```

**Generate itinerary AI** — `POST /api/v1/trips/1/generate`

Response berisi field tambahan `ai_recommendation` dengan itinerary harian terstruktur (Morning / Afternoon / Evening) untuk setiap hari perjalanan.

---

## Riwayat Sesi

| Tag | Fitur | Tanggal |
|---|---|---|
| `v0.1.0` | Trip Summary Generator (aplikasi konsol) | 10 Agustus |
| `session-2` | Recommendation Engine — kategori, season, daily budget, rekomendasi tempat | 14 Agustus |
| `session-3` | REST API dengan FastAPI + endpoint recommendations & transportations | 15–16 Agustus |
| `session-4` | Persistence layer dengan PostgreSQL — CRUD lengkap (Create, Read, Update, Delete) | 21 Agustus |
| `session-5` | Integrasi Amazon Bedrock — AI-generated itinerary tersimpan ke database | 24 Agustus |

---

## Prinsip Desain

- **Separation of concerns** — logika bisnis (`trip_service.py`) tidak pernah bergantung pada cara data masuk/keluar (konsol, REST API, atau AI). Fungsi yang sama dipakai ulang di seluruh lapisan tanpa modifikasi.
- **Persistence terpisah dari logic** — `database.py` dan `models/` mengurus penyimpanan; `main.py` mengurus komunikasi HTTP.
- **Kredensial tidak pernah di-hardcode** — semua secret (password database, token AWS) disimpan di `.env` dan diabaikan oleh Git.

