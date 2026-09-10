# 🎬 Script Video Dokumentasi - KelanaTrip AI Travel Planner

## 📋 **Informasi Video**
- **Judul**: KelanaTrip AI - AI-Powered Travel Planning Assistant
- **Durasi Target**: 5-7 menit
- **Bahasa**: Indonesia
- **Platform**: YouTube / Presentation

---

## 🎯 **Scene 1: Opening & Introduction (30 detik)**

### **Visual**: Tampilan homepage KelanaTrip AI
### **Script**:

> "Halo! Selamat datang di video dokumentasi project KelanaTrip AI.
>
> KelanaTrip AI adalah aplikasi travel planning assistant berbasis AI yang saya kembangkan menggunakan teknologi modern seperti Next.js 15, FastAPI, dan AWS Bedrock.
>
> Aplikasi ini membantu pengguna merencanakan perjalanan dengan rekomendasi yang dipersonalisasi menggunakan AI dan Knowledge Base yang terintegrasi.
>
> Mari kita lihat fitur-fitur yang ada!"

### **Action**:
- Show logo/landing page
- Scroll homepage dengan smooth
- Highlight tagline: "Rencanakan Perjalanan dengan AI"

---

## 🎯 **Scene 2: Tech Stack Overview (40 detik)**

### **Visual**: Slide atau diagram arsitektur
### **Script**:

> "Sebelum masuk ke demo, saya jelaskan dulu tech stack yang digunakan.
>
> **Frontend** dibangun dengan:
> - Next.js 15 dengan App Router
> - TypeScript untuk type safety
> - Tailwind CSS untuk styling
> - Deployed di Vercel
>
> **Backend** menggunakan:
> - FastAPI dengan Python
> - PostgreSQL database di Neon
> - AWS Bedrock untuk AI generation
> - JWT authentication
> - Deployed di FastAPI Cloud
>
> **AI Integration**:
> - Amazon Bedrock dengan model Nova Lite
> - Knowledge Base untuk RAG (Retrieval Augmented Generation)
> - Custom travel guides untuk Bali, Tokyo, dan Istanbul
>
> Semuanya sudah production-ready dan deployed!"

### **Action**:
- Show tech stack diagram
- Briefly show GitHub repo structure
- Show deployment URLs

---

## 🎯 **Scene 3: Authentication System (1 menit)**

### **Visual**: Register & Login flow
### **Script**:

> "Mari kita mulai dari fitur authentication.
>
> **Register User Baru**
>
> Pengguna bisa register dengan mengisi email, username, dan password. Sistem akan validasi:
> - Email format harus valid
> - Username minimal 3 karakter
> - Password minimal 6 karakter
> - Check duplicate email dan username
>
> Password akan di-hash menggunakan bcrypt sebelum disimpan ke database untuk keamanan.
>
> Setelah register berhasil, user otomatis login dan mendapat JWT token yang expire dalam 24 jam.
>
> **Login**
>
> User bisa login menggunakan email atau username, plus password.
> Token disimpan di localStorage dan cookie untuk persistent authentication.
>
> Mari kita coba!"

### **Action**:
1. Show register page (https://kelanatrip-ai.vercel.app/register)
2. Fill form dengan data dummy
3. Submit dan show redirect ke dashboard
4. Logout
5. Login kembali dengan credentials yang sama
6. Show successful login

---

## 🎯 **Scene 4: Dashboard & Trip Planning (1.5 menit)**

### **Visual**: Dashboard dan Create Trip flow
### **Script**:

> "Setelah login, user masuk ke dashboard yang menampilkan overview trips mereka.
>
> **Dashboard Features:**
> - List semua trips yang pernah dibuat
> - Quick stats: total trips, budget summary
> - Easy navigation ke semua fitur
>
> **Create New Trip**
>
> Mari kita buat trip baru ke Bali!
>
> User bisa input:
> - **Destination**: Kemana mau pergi
> - **Duration**: Berapa hari
> - **Budget**: Total budget dalam rupiah
> - **Travel Style**: Budget, Balanced, atau Luxury
>
> Sistem akan otomatis calculate:
> - Daily budget (budget per hari)
> - Trip category berdasarkan total budget
>
> Data tersimpan di database PostgreSQL dengan relasi ke user ID.
>
> Sekarang trip sudah tersimpan, kita bisa generate AI recommendation!"

### **Action**:
1. Show dashboard with existing trips
2. Click "Create Trip" button
3. Fill form:
   - Destination: "Bali"
   - Days: 5
   - Budget: 5000000
   - Travel Style: "Balanced"
4. Submit dan show trip card muncul di dashboard
5. Click trip card untuk detail

---

## 🎯 **Scene 5: AI Trip Recommendations (1 menit)**

### **Visual**: Generate AI recommendation
### **Script**:

> "Ini bagian paling menarik - AI-powered recommendations!
>
> Dengan click satu tombol, sistem akan:
> 1. Mengambil data trip (destination, budget, duration, travel style)
> 2. Mengirim request ke AWS Bedrock
> 3. AI generate itinerary lengkap day-by-day
> 4. Rekomendasi tempat wisata, restaurant, activities
> 5. Budget breakdown per hari
>
> AI menggunakan Knowledge Base yang sudah saya prepare dengan travel guides untuk berbagai destinasi.
>
> Hasilnya sangat detailed dan personalized sesuai budget dan travel style user.
>
> Let's generate!"

### **Action**:
1. Click "Generate AI Recommendation" button
2. Show loading state
3. Show hasil AI generation:
   - Day-by-day itinerary
   - Budget breakdown
   - Activities & places
4. Scroll through recommendations

---

## 🎯 **Scene 6: AI Assistant Chat (1.5 menit)**

### **Visual**: Assistant page dengan chat interface
### **Script**:

> "Selain generate trip recommendations, ada juga AI Assistant chat!
>
> **AI Assistant Features:**
> - Tanya jawab interaktif tentang travel
> - Menggunakan RAG (Retrieval Augmented Generation)
> - Response berdasarkan Knowledge Base
> - Chat history tersimpan per conversation
>
> Knowledge Base berisi informasi detail tentang:
> - Best time to visit
> - Local transportation
> - Cultural tips
> - Food recommendations
> - Budget planning
> - Safety information
>
> Mari kita coba tanya sesuatu!"

### **Action**:
1. Go to Assistant page
2. Create new conversation
3. Ask question: "What's the best time to visit Bali?"
4. Show AI response with sources
5. Ask follow-up: "What about budget accommodation recommendations?"
6. Show conversation history
7. Create new conversation
8. Show list of past conversations

---

## 🎯 **Scene 7: History & Profile Management (1 menit)**

### **Visual**: History page dan Settings
### **Script**:

> "**Trip History**
>
> User bisa lihat semua trips yang pernah dibuat, lengkap dengan:
> - Destination dan duration
> - Budget information
> - AI recommendations (jika sudah generate)
> - Filter dan search capabilities
>
> **Profile Settings**
>
> User bisa update:
> - Username
> - Email
> - Password (dengan verify password lama dulu)
>
> Semua perubahan langsung tersimpan ke database dengan validasi yang proper.
>
> Ada juga conversation history untuk tracking semua chat dengan AI Assistant."

### **Action**:
1. Show History page dengan list trips
2. Click one trip untuk detail view
3. Go to Settings page
4. Show profile information
5. Demo update username
6. Show success message
7. Go to conversation history

---

## 🎯 **Scene 8: Architecture Deep Dive (1 menit)**

### **Visual**: Code snippets & architecture diagram
### **Script**:

> "Sekarang saya jelaskan sedikit tentang arsitektur aplikasi.
>
> **Backend Architecture:**
>
> FastAPI dengan clean architecture:
> - Main.py: API endpoints dengan route handlers
> - Models: SQLAlchemy ORM untuk database
> - Services: Business logic layer (auth, trips, AI)
> - Database: Connection pooling untuk Neon PostgreSQL
>
> **API Endpoints:**
> - Auth: register, login, get user info
> - Trips: CRUD operations + AI generation
> - Conversations: Chat management + message history
> - Knowledge Base: RAG query endpoint
>
> **Frontend Architecture:**
>
> Next.js 15 dengan App Router:
> - Server Components untuk SEO
> - Client Components untuk interactivity
> - Context API untuk state management
> - Middleware untuk route protection
>
> **Security Features:**
> - JWT token authentication
> - Password hashing dengan bcrypt
> - CORS configuration
> - Input validation dengan Pydantic
> - SQL injection protection via ORM
>
> **Database Schema:**
> - Users table dengan hashed passwords
> - Trips table dengan foreign key ke users
> - Conversations & Messages untuk chat history
> - Proper indexing untuk performance"

### **Action**:
- Show code snippets dari main.py
- Show database schema diagram
- Show AuthContext code
- Briefly show folder structure

---

## 🎯 **Scene 9: Deployment Process (1 menit)**

### **Visual**: Deployment dashboards
### **Script**:

> "Project ini fully deployed di production!
>
> **Frontend Deployment - Vercel:**
> - Auto-deploy dari GitHub main branch
> - Custom domain: kelanatrip-ai.vercel.app
> - Environment variables untuk API URL
> - Edge network untuk fast global access
>
> **Backend Deployment - FastAPI Cloud:**
> - Docker containerization
> - Environment variables untuk secrets
> - PostgreSQL connection ke Neon
> - AWS credentials untuk Bedrock
>
> **Database - Neon PostgreSQL:**
> - Serverless PostgreSQL
> - Auto-scaling
> - Connection pooling
> - Daily backups
>
> **CI/CD Flow:**
> 1. Push code ke GitHub
> 2. Vercel auto-build frontend
> 3. FastAPI Cloud pull latest code
> 4. Environment variables injected
> 5. Deploy to production
>
> Semua berjalan otomatis!"

### **Action**:
- Show Vercel deployment dashboard
- Show FastAPI Cloud logs
- Show Neon database console
- Show GitHub repository

---

## 🎯 **Scene 10: Challenges & Solutions (1 menit)**

### **Visual**: Code examples atau problem-solving diagram
### **Script**:

> "Selama development, ada beberapa challenges yang saya hadapi:
>
> **Challenge 1: CORS Issues**
> - Problem: Frontend tidak bisa hit backend API
> - Solution: Configure CORS di FastAPI dengan Vercel domain
> - Learning: Always set proper CORS origins untuk production
>
> **Challenge 2: Database Connection**
> - Problem: SSL connection errors ke Neon
> - Solution: Add proper connection pooling dan SSL parameters
> - Learning: Production databases need different config than local
>
> **Challenge 3: Password Hashing**
> - Problem: Bcrypt compatibility dengan Python 3.14
> - Solution: Downgrade bcrypt version dan simplify hash function
> - Learning: Dependencies version compatibility is crucial
>
> **Challenge 4: Environment Variables**
> - Problem: NEXT_PUBLIC prefix untuk client-side env vars
> - Solution: Proper naming dan set di Vercel dashboard
> - Learning: Next.js has specific rules for env vars
>
> **Challenge 5: JWT Token Management**
> - Problem: Token storage untuk persistent auth
> - Solution: Store di localStorage + cookie
> - Learning: Cookie for middleware, localStorage for client state
>
> Semua challenges ini membuat saya belajar banyak tentang production deployment!"

### **Action**:
- Show before/after code examples
- Highlight key solutions
- Show successful results

---

## 🎯 **Scene 11: Demo Full User Journey (1 menit)**

### **Visual**: Quick walkthrough end-to-end
### **Script**:

> "Sekarang mari kita lihat complete user journey dari awal sampai akhir!
>
> 1. User register account baru
> 2. Otomatis login dan masuk dashboard
> 3. Create trip baru ke Bali - 5 hari, budget 5 juta
> 4. Generate AI recommendations - dapat itinerary lengkap
> 5. Tanya AI Assistant tentang best time to visit
> 6. Check history untuk lihat semua trips
> 7. Update profile settings
> 8. Logout dengan aman
>
> Semua flow berjalan smooth dan responsif!"

### **Action**:
- Quick speed run through all features
- Show responsive design (desktop to mobile if possible)
- No pauses, continuous flow

---

## 🎯 **Scene 12: Future Improvements (30 detik)**

### **Visual**: Roadmap atau feature list
### **Script**:

> "Untuk kedepannya, ada beberapa improvements yang bisa ditambahkan:
>
> **Planned Features:**
> - Export trip itinerary ke PDF
> - Collaborative trip planning (multiple users)
> - Real-time weather integration
> - Budget tracking & expense management
> - Social features: share trips, reviews
> - Mobile app dengan React Native
> - Multi-language support
> - Integration dengan booking platforms
>
> **Technical Improvements:**
> - Redis caching untuk performance
> - WebSocket untuk real-time chat
> - Better error handling & logging
> - Monitoring dengan Sentry
> - Load testing & optimization
>
> Project ini adalah foundation yang solid untuk features tersebut!"

---

## 🎯 **Scene 13: Closing & Call to Action (30 detik)**

### **Visual**: Project links & contact info
### **Script**:

> "Terima kasih sudah menonton video dokumentasi KelanaAI!
>
> **Project Links:**
> - Live Demo: https://kelanatrip-ai.vercel.app
> - GitHub Repository: [your-github-repo-url]
> - Backend API: https://kelana-ai-e20bf1c3.fastapicloud.dev
>
> **Tech Stack Summary:**
> - Frontend: Next.js 15, TypeScript, Tailwind CSS
> - Backend: FastAPI, Python, PostgreSQL
> - AI: AWS Bedrock, RAG with Knowledge Base
> - Deployment: Vercel, FastAPI Cloud, Neon
>
> **Key Learnings:**
> - Full-stack development with modern tools
> - AI integration dengan AWS Bedrock
> - Production deployment & DevOps
> - Problem solving & debugging
>
> Kalau ada pertanyaan atau ingin collaborate, feel free to reach out!
>
> Happy coding dan selamat traveling! ✈️🌍"

### **Action**:
- Show contact information
- Show GitHub stars/follow button
- End screen dengan project logo

---

## 📝 **Recording Tips:**

### **Preparation:**
1. ✅ Clean browser cache untuk fresh demo
2. ✅ Prepare dummy accounts untuk testing
3. ✅ Check internet connection stable
4. ✅ Close unnecessary apps/notifications
5. ✅ Test audio & video quality
6. ✅ Prepare backup recording

### **Recording Settings:**
- **Screen Resolution**: 1920x1080 (Full HD)
- **Frame Rate**: 60fps untuk smooth motion
- **Audio**: Clear voice, minimal background noise
- **Cursor**: Show cursor untuk guidance
- **Zoom**: Zoom in untuk important details

### **Editing Notes:**
- Add background music (soft, non-intrusive)
- Add text overlays untuk key points
- Speed up boring parts (installing dependencies, waiting)
- Add smooth transitions between scenes
- Color correction untuk consistency
- Add captions/subtitles (opsional)

### **B-Roll Suggestions:**
- Code snippets dengan syntax highlighting
- Terminal commands execution
- Architecture diagrams
- Database schema visualization
- API request/response examples

---

## 🎬 **Alternative: Short Version (3 menit)**

Kalau mau versi pendek, fokus ke:
1. Introduction (20 detik)
2. Tech Stack (20 detik)
3. Live Demo (1.5 menit)
4. Architecture Overview (40 detik)
5. Closing (10 detik)

---

## 📊 **Metrics to Highlight:**

- ✅ **18 API endpoints** fully functional
- ✅ **4 database tables** with proper relationships
- ✅ **100% deployed** to production
- ✅ **JWT authentication** with secure password hashing
- ✅ **AI-powered** recommendations via AWS Bedrock
- ✅ **RAG system** with custom Knowledge Base
- ✅ **Responsive design** mobile-friendly
- ✅ **Type-safe** with TypeScript
- ✅ **Production-ready** with error handling

---

**Good luck dengan video dokumentasinya bro! 🎥🚀**
