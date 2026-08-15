# KelanaAI
AI Travel Planner Python.

## Sesi 1: Trip Summary Generator

Aplikasi konsol yang menerima input detail perjalanan dan menampilkan ringkasannya.

## Cara Menjalankan

masuk ke folder backend kemudian ketik:
python3 main.py

## Versi

- v0.1.0 — Trip Summary Generator (aplikasi konsol)
- session-2 — Recommendation Engine (kategori, season, daily budget, rekomendasi tempat) 14 Agustus 23:13
- session-3 — REST API dengan FastAPI, 15 Agustus 03:01
<pre> ## Instalasi ```bash cd backend python3 -m venv venv source venv/bin/activate pip install fastapi uvicorn ``` ## Cara Menjalankan ### REST API (sesi 3) ```bash cd backend source venv/bin/activate uvicorn main:app --reload ``` Buka dokumentasi interaktif di http://localhost:8000/docs ### Aplikasi Konsol (sesi 1–2) ```bash cd backend python3 console_app.py ``` ## API Endpoints | Method | Endpoint | Deskripsi | |---|---|---| | GET | `/` | Pesan sambutan | | GET | `/health` | Health check | | POST | `/api/v1/trips` | Hitung kategori & anggaran harian | ## Contoh Request & Response Request `POST /api/v1/trips`: ```json { "destination": "Japan", "days": 5, "budget": 2000 } ``` Response `200 OK`: ```json { "destination": "Japan", "days": 5, "budget": 2000.0, "daily_budget": 400.0, "category": "Standard" } ``` ## Versi - v0.1.0 — Trip Summary Generator (aplikasi konsol) - session-2 — Recommendation Engine (kategori, season, daily budget) - session-3 — REST API dengan FastAPI </pre>
- session-3.1 — Menambah recommendations dan transportations, 16 Agustus 00:26
