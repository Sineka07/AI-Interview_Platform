# AI Interview Preparation & Evaluation Platform 🎯🎙️

An AI-powered full-stack web platform designed to help college students prepare with confidence for campus placements and technical interviews. It conducts real-time mock interviews using live camera and microphone, continuously evaluating what the candidate said (LLM answer quality), how they said it (speech speed & filler words), and how they presented themselves (MediaPipe non-verbal body language and eye contact).

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite) | Core Single Page Application UI |
| **Styling** | Tailwind CSS | Sleek, modern dark aesthetic designed for focus |
| **Navigation** | React Router Dom | Client-side routing between Login, Dashboard, Interview Room & Feedback |
| **Charts** | Recharts | Competency radar charts, score trajectories, and readiness meters |
| **Backend** | Java 25 & Spring Boot 3 | Enterprise REST API server |
| **Security** | Spring Security & JWT | Stateless token-based authentication & role authorization |
| **Database** | MySQL 8.0 / H2 | Relational schema for users, questions, responses, and scores |
| **Computer Vision** | HTML5 Canvas / MediaPipe | Real-time face tracking, eye-contact estimation, and posture stability |
| **Speech Analytics** | Web Speech API / NLP | Live Speech-to-Text transcription, filler word counting, and WPM pace |
| **AI Evaluation** | Gemini / OpenAI / Rule-Engine | Contextual resume parsing, question generation, and STAR critique |

---

## 🚀 Quick Start Guide

### 1. Backend Setup

The backend can connect to your local MySQL database, or run in zero-config mode using the built-in H2 database.

#### Option A: Running with Built-in Database (Zero-Configuration)
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

#### Option B: Running with Local MySQL
1. Ensure MySQL Server is running on port 3306.
2. The application will automatically create the database `ai_interview_db`.
3. Provide your MySQL password if configured:
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.datasource.password=YOUR_PASSWORD"
```

The REST API server will be live at `http://localhost:8080`.

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend application will be live at `http://localhost:5173`.

---

## 💡 Key Features & Workflow

1. **Student Authentication & Resume Profiling**:
   - Register with college name and target job role (SDE, Frontend, Backend, Data, etc.).
   - Paste resume text; the AI engine automatically parses technical keywords (e.g., Java, React, Docker, Spring, SQL).

2. **Customized Mock Interview Configuration**:
   - Select Difficulty: **Easy** (fundamentals), **Medium** (architecture & problem solving), or **Hard** (distributed systems & edge cases).
   - Select Category: **Technical**, **Behavioral (STAR)**, **HR**, or **Mixed**.
   - Choose question count (3, 5, or 8 questions).

3. **Live AI Interview Room**:
   - **Computer Vision HUD**: Real-time webcam feed tracking eye contact (direct gaze vs looking away) and posture stability.
   - **Voice AI Interviewer**: Speaks questions aloud with natural pacing and replay controls.
   - **Live Speech-to-Text**: Transcribes candidate voice answers in real-time, displays speaking timer and live Words-Per-Minute (WPM).
   - **Filler-Word Counter**: Flags filler words (`um`, `uh`, `like`, `basically`, `actually`, `you know`) dynamically.
   - **Immediate Question Evaluation**: Instant feedback on technical correctness and delivery before moving to the next question.

4. **Comprehensive Feedback Report**:
   - **Placement Readiness Badge**: Overall readiness verdict (*Ready for Placements*, *Needs Minor Polish*, *Needs Focused Revision*).
   - **Radar Competency Chart**: 5-pillar breakdown across Technical Accuracy, Eye Contact, Verbal Fluency, Posture, and Confidence.
   - **Question-by-Question Deep Dive**: Side-by-side comparison of candidate answer transcript, AI suggested ideal answer, and key strengths.
   - **Printable Report**: Export or print as PDF for placement cell review.
