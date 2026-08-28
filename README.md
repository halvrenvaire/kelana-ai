# KelanaAI

**AI Travel Planner** — dibangun bertahap dari script Python sederhana menjadi full-stack web app dengan REST API, PostgreSQL, Amazon Bedrock, dan Next.js.

---

## Tentang Proyek

KelanaAI adalah aplikasi perencana perjalanan yang dikembangkan selama bootcamp MAIN Phase 2. Dibangun bertahap tiap sesi dengan arsitektur berlapis yang memisahkan business logic, persistence layer, dan presentation layer — kini lengkap dengan antarmuka web modern berbasis Next.js.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS v4 |
| **Backend** | Python, FastAPI, Uvicorn |
| **Database** | PostgreSQL, SQLAlchemy (ORM) |
| **AI** | Amazon Bedrock (`amazon.nova-lite-v1:0`) |
| **Version Control** | Git & GitHub |

---

## Struktur Proyek

```
kelana-ai/
├── backend/
│   ├── main.py              # FastAPI app — presentation & web layer
│   ├── database.py          # Koneksi database (engine, SessionLocal, Base)
│   ├── console_app.py       # Versi konsol (sesi 1–2, arsip)
│   ├── requirements.txt
│   ├── models/
│   │   └── trip.py          # Definisi tabel trips (SQLAlchemy ORM)
│   └── services/
│       ├── trip_service.py  # Business logic (kategori, daily budget)
│       └── bedrock_service.py # Integrasi Amazon Bedrock
└── frontend/
    ├── app/
    │   ├── layout.tsx       # Root layout, metadata, global Navbar
    │   ├── page.tsx         # Halaman utama — form & AI result
    │   ├── about/           # Halaman tentang
    │   └── history/         # Trip History Dashboard + detail per trip
    └── components/
        ├── Navbar.tsx       # Sticky navbar dengan active link indicator
        ├── Hero.tsx         # Hero section dengan background image
        ├── TripForm.tsx     # Form input perjalanan dengan autocomplete
        ├── TripCard.tsx     # Kartu trip (icon, currency format, badges)
        ├── TripResult.tsx   # Tampilan hasil itinerary AI
        ├── Features.tsx     # Feature cards
        └── Footer.tsx       # Footer navigasi
```

---

## Setup & Instalasi

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

### Konfigurasi Environment

Buat file `.env` di dalam folder `backend/`:

```env
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/kelana_ai
AWS_BEARER_TOKEN_BEDROCK=<token_bedrock_anda>
AWS_REGION=ap-southeast-2
MODEL_ID=amazon.nova-lite-v1:0
```

Buat file `.env.local` di dalam folder `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> File `.env` dan `.env.local` tidak di-push ke repositori (lihat `.gitignore`). Setiap environment baru wajib membuat file ini secara manual.

### Setup Database

```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE kelana_ai;
```

Tabel dibuat otomatis saat backend pertama kali dijalankan (`init_db()`).

---

## Cara Menjalankan

**Backend (FastAPI):**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```
Dokumentasi interaktif tersedia di `http://localhost:8000/docs`

**Frontend (Next.js):**
```bash
cd frontend
npm run dev
```
Buka `http://localhost:3000` di browser.

**Aplikasi Konsol (arsip sesi 1–2):**
```bash
cd backend
python3 console_app.py
```

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
| POST | `/api/v1/trips/{id}/generate` | Generate itinerary harian via Amazon Bedrock, simpan ke DB |

---

## Contoh Request & Response

**Membuat trip baru** — `POST /api/v1/trips`
```json
{
  "destination": "Tokyo, Japan",
  "days": 5,
  "budget": 2000
}
```

Response `200 OK`:
```json
{
  "id": 1,
  "destination": "Tokyo, Japan",
  "days": 5,
  "budget": 2000.0,
  "daily_budget": 400.0,
  "category": "mid",
  "ai_recommendation": null
}
```

**Generate itinerary AI** — `POST /api/v1/trips/1/generate`

Response menyertakan field `ai_recommendation` berisi itinerary harian terstruktur (Morning / Afternoon / Evening) untuk setiap hari perjalanan, dihasilkan oleh Amazon Bedrock.

---

## Riwayat Sesi

| Tag | Fitur | Tanggal |
|---|---|---|
| `v0.1.0` | Trip Summary Generator — aplikasi konsol Python | 10 Agustus |
| `session-2` | Recommendation Engine — kategori, season, daily budget, rekomendasi tempat | 14 Agustus |
| `session-3` | REST API dengan FastAPI + endpoint recommendations & transportations | 15–16 Agustus |
| `session-4` | Persistence layer dengan PostgreSQL — CRUD lengkap | 21 Agustus |
| `session-5` | Integrasi Amazon Bedrock — AI-generated itinerary tersimpan ke database | 24 Agustus |
| `session-6` | Frontend Next.js — hero image, responsive form, Tailwind styling, footer | 26 Agustus |
| `session-7` | Trip History Dashboard — TripCard dengan icon, currency format, badges, pagination | 26 Agustus |

---

## Prinsip Desain

- **Separation of concerns** — business logic (`trip_service.py`) tidak bergantung pada cara data masuk/keluar. Fungsi yang sama dipakai ulang di seluruh lapisan tanpa modifikasi.
- **Persistence terpisah dari logic** — `database.py` dan `models/` mengurus penyimpanan; `main.py` mengurus HTTP; `frontend/` mengurus tampilan.
- **Kredensial tidak pernah di-hardcode** — semua secret (password database, token AWS) disimpan di `.env` / `.env.local` dan diabaikan oleh Git.
- **Progressive enhancement** — tiap sesi menambah lapisan baru tanpa merombak yang sudah berjalan.
