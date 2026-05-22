# AI Study Assistant Platform

A full-stack platform where students create notes, quizzes, and tasks — with an AI assistant that summarizes lessons, generates MCQ quizzes, and answers questions.

## Tech Stack
- **Backend**: Spring Boot 3.2, Spring Security, JWT, JPA/Hibernate
- **Frontend**: React 18, Vite, React Router
- **Database**: MySQL
- **AI**: Claude (Anthropic API)

---

## ✅ Prerequisites

Make sure you have these installed:
- Java 17+
- Maven 3.8+
- Node.js 18+
- MySQL 8.0+

---

## 🔧 Setup (2 steps)

### Step 1 — Configure the backend

Open `backend/src/main/resources/application.properties` and set:

```properties
spring.datasource.password=YOUR_MYSQL_PASSWORD
app.claude.api-key=YOUR_ANTHROPIC_API_KEY
```

Get your Claude API key from: https://console.anthropic.com

### Step 2 — Run everything

**Terminal 1 — Backend:**
```bash
cd backend
mvn spring-boot:run
```
Runs on http://localhost:8080

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5173

Open http://localhost:5173 in your browser.

---

## 📁 Project Structure

```
ai-study-platform/
├── backend/                          ← Spring Boot API
│   ├── pom.xml
│   └── src/main/java/com/studyai/
│       ├── StudyPlatformApplication.java
│       ├── ai/          ClaudeAiService.java
│       ├── config/      SecurityConfig, GlobalExceptionHandler
│       ├── controller/  Auth, Note, Quiz, Task, AI controllers
│       ├── dto/         All request/response DTOs
│       ├── model/       User, Note, Quiz, QuizQuestion, Task
│       ├── repository/  JPA repositories
│       ├── security/    JwtUtil, JwtAuthFilter
│       └── service/     Auth, Note, Quiz, Task services
│
└── frontend/                         ← React app
    ├── package.json
    └── src/
        ├── App.jsx
        ├── components/  Layout (sidebar)
        ├── context/     AuthContext (JWT state)
        ├── pages/       Dashboard, Notes, Quizzes, Tasks, AIChat, Login, Register
        └── services/    api.js (Axios + JWT interceptor)
```

---

## 🚀 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login, get JWT |
| GET/POST/PUT/DELETE | /api/notes | CRUD notes |
| POST | /api/notes/{id}/summarize | AI summarize a note |
| GET/POST/DELETE | /api/quizzes | CRUD quizzes |
| POST | /api/quizzes/generate | AI generate MCQ quiz |
| GET/POST/PUT/DELETE | /api/tasks | CRUD tasks |
| POST | /api/ai/chat | AI chatbot |
| POST | /api/ai/summarize | AI summarize text |
| POST | /api/ai/explain | AI explain a concept |
