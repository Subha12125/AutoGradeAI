<div align="center">

# Evalify AI

### AI-Powered Automated Answer Sheet Evaluation Platform

**Evaluate. Analyze. Improve.**

Automating student assessment with multimodal Generative AI.

<br/>

[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-AI-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

</div>

---

## About

**Evalify AI** is a full-stack AI-powered assessment platform designed to help educators automate the evaluation of student answer sheets.

Traditional answer-sheet evaluation is time-consuming, repetitive, difficult to scale, and provides limited opportunities for structured performance analysis. Evalify AI addresses these challenges by combining **OCR, multimodal Generative AI, semantic analysis, and rubric-based evaluation**.

The platform supports both **handwritten and typed answer sheets**, generates structured marks and feedback, enables faculty review, and provides analytics and exportable results.

> **From answer-sheet upload to structured evaluation — Evalify AI brings the complete assessment workflow into one platform.**

---

## Key Features

| Capability | Description |
|---|---|
| **AI Evaluation** | Evaluates student responses using Google Gemini and structured grading criteria. |
| **Handwritten Support** | Processes scanned handwritten answer sheets through OCR and multimodal AI. |
| **Typed PDF Support** | Supports digitally generated answer sheets and PDF submissions. |
| **Batch Processing** | Evaluate multiple student submissions through a single workflow. |
| **Rubric-Based Scoring** | Uses question-specific evaluation criteria instead of simple keyword matching. |
| **Performance Analytics** | Provides student, question-wise, and class-level insights. |
| **Live Progress** | Tracks long-running evaluation jobs through status polling. |
| **Human Review** | Allows educators to review and modify AI-generated evaluations. |
| **Result Export** | Export evaluation results in CSV and PDF formats. |
| **Authentication** | Protects application resources with JWT-based authentication. |

---

## System Architecture

```text
                         +----------------------+
                         |      Educator        |
                         |     / Faculty        |
                         +----------+-----------+
                                    |
                                    v
                         +----------------------+
                         |    React + Vite UI   |
                         |                      |
                         | Dashboard             |
                         | Exam Management       |
                         | Upload Interface      |
                         | Results & Analytics   |
                         +----------+-----------+
                                    |
                              REST API
                                    |
                                    v
                         +----------------------+
                         |   Node.js + Express   |
                         |                      |
                         | Authentication       |
                         | Exam Management      |
                         | File Processing      |
                         | Evaluation Logic     |
                         +------+----------+----+
                                |          |
                    +-----------+          +-----------+
                    v                                  v
          +------------------+                +------------------+
          | Supabase Storage |                | Google Gemini AI |
          |                  |                |                  |
          | PDFs             |                | Multimodal AI    |
          | Images           |                | Semantic Analysis|
          | Answer Sheets    |                | Scoring          |
          +--------+---------+                +--------+---------+
                   |                                   |
                   +---------------+-------------------+
                                   v
                         +----------------------+
                         | PostgreSQL /         |
                         | Supabase Database    |
                         |                      |
                         | Exams                |
                         | Questions            |
                         | Submissions          |
                         | Evaluations          |
                         +----------------------+
```

---

## Technology Stack

### Frontend

| Technology | Role |
|---|---|
| React 18 | User interface |
| Vite | Development and build tooling |
| Zustand | State management |
| React Router 6 | Client-side routing |
| Vanilla CSS | Styling and responsive UI |

### Backend

| Technology | Role |
|---|---|
| Node.js | Backend runtime |
| Express.js | REST API framework |
| JWT | Authentication |
| Multer | Multipart file uploads |
| Google Gemini API | Multimodal AI evaluation |

### Infrastructure

| Technology | Role |
|---|---|
| Supabase | Backend infrastructure |
| PostgreSQL | Persistent database |
| Supabase Storage | PDF and image storage |

---

## Evaluation Workflow

```text
1. Create Exam
       |
       v
2. Upload Question Paper + Rubric + Answer Sheets
       |
       v
3. Document Processing / OCR
       |
       v
4. Question & Answer Extraction
       |
       v
5. Gemini Multimodal Evaluation
       |
       v
6. Score + Feedback + Reasoning
       |
       v
7. Store Results in PostgreSQL
       |
       v
8. Faculty Review & Correction
       |
       v
9. Analytics + CSV/PDF Export
```

### Evaluation Input

The AI evaluation combines:

```text
Question
   +
Student Answer
   +
Expected Answer / Evaluation Criteria
   +
Question-Specific Rubric
        |
        v
Semantic Evaluation
        |
        v
Score + Feedback + Reasoning
```

This keeps the system **AI-assisted and human-verifiable**, rather than treating generated scores as automatically final.

---

## Project Structure

```text
Evalify-Ai/
|
+-- client/
|   +-- src/
|   |   +-- components/
|   |   +-- pages/
|   |   +-- store/
|   |   +-- services/
|   |   +-- ...
|   +-- package.json
|
+-- server/
|   +-- controllers/
|   +-- routes/
|   +-- services/
|   +-- middleware/
|   +-- utils/
|   +-- uploads/
|   +-- package.json
|
+-- LICENSE
+-- README.md
```

> The structure may evolve as the project continues to develop.

---

## Getting Started

### Prerequisites

Make sure you have:

- Node.js 18+
- npm or pnpm
- A Supabase project
- A Google Gemini API key

### Clone the Repository

```bash
git clone https://github.com/Subha12125/Evalify-Ai.git
cd Evalify-Ai
```

### Backend Setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_service_role_key
GEMINI_API_KEY=your_google_gemini_api_key
JWT_SECRET=your_secure_random_secret
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

### Frontend Setup

Open another terminal:

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open the local development URL displayed by Vite.

---

## Environment Variables

### Server

| Variable | Description |
|---|---|
| `PORT` | Backend server port |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Server-side Supabase service key |
| `GEMINI_API_KEY` | Google Gemini API key |
| `JWT_SECRET` | JWT signing secret |
| `CLIENT_URL` | Frontend URL |

### Client

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |

> **Security:** Never commit `.env` files, API keys, JWT secrets, or Supabase service-role credentials to the repository.

---

## API Overview

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a user |
| `POST` | `/api/auth/login` | Authenticate a user |

### Exams

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/exams` | Create an exam |
| `GET` | `/api/exams/:examId` | Retrieve exam information |

### Evaluation

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/evaluate` | Upload answers and start evaluation |
| `GET` | `/api/evaluate/status/:id` | Retrieve evaluation progress |

### Results

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/results/:examId` | Retrieve evaluation results |
| `POST` | `/api/results/:examId/review` | Review or update evaluation |

Protected endpoints require:

```http
Authorization: Bearer <JWT>
```

---

## Data Model

```text
User
 |
 +-- Exam
      |
      +-- Questions
      |     +-- Rubric
      |
      +-- Submissions
             |
             +-- Evaluations
                    +-- Score
                    +-- Feedback
                    +-- AI Reasoning
                    +-- Reviewer Information
```

### Core Entities

**Users**

```text
id
name
email
role
password
created_at
```

**Exams**

```text
id
title
subject
total_marks
created_by
created_at
```

**Questions**

```text
id
exam_id
question_text
max_marks
rubric
```

**Submissions**

```text
id
exam_id
student_id
files
status
created_at
```

**Evaluations**

```text
id
submission_id
question_id
score
feedback
model_rationale
reviewed_by
reviewed_at
```

---

## Security

Evalify AI handles potentially sensitive academic information, so security is an important part of the architecture.

- JWT-based authentication for protected API resources.
- Environment-based secret management.
- File type and size validation for uploads.
- Avoid logging student answers or sensitive personal information.
- Restrict database and storage access according to user roles.
- Keep Supabase service-role credentials server-side only.

---

## Testing

Recommended testing workflow:

### Backend

```bash
cd server
npm test
```

### Frontend

```bash
cd client
npm test
```

### Integration Flow

```text
Upload
  |
  v
Processing
  |
  v
AI Evaluation
  |
  v
Database Persistence
  |
  v
Result Retrieval
  |
  v
Review
  |
  v
Export
```

---

## Deployment

For production deployments, the recommended architecture is:

```text
Users
  |
  v
Frontend
  |
  v
Node.js / Express Backend
  |
  +------------------+
  |                  |
  v                  v
Supabase          Gemini API
DB + Storage
```

For larger workloads, long-running evaluation tasks can be moved to background workers using technologies such as **Redis + BullMQ**.

Production deployments should also use:

- Secure secret management
- HTTPS
- Rate limiting
- Upload validation
- Database access policies
- Background job processing
- Monitoring and structured logging

---

## Why Evalify AI?

| Traditional Evaluation | Evalify AI |
|---|---|
| Manual checking | AI-assisted evaluation |
| Time-consuming | Automated processing |
| Difficult to scale | Batch evaluation |
| Limited analytics | Question-level analytics |
| Manual feedback | AI-generated feedback |
| Paper-based records | Digital results |
| Variable evaluation workflow | Structured rubric-based evaluation |

---

## Roadmap

- [ ] Background evaluation workers
- [ ] Redis / BullMQ job queues
- [ ] Advanced OCR preprocessing
- [ ] Improved handwriting recognition
- [ ] Question-level confidence scores
- [ ] Custom teacher-defined rubrics
- [ ] Advanced class analytics
- [ ] Student performance history
- [ ] AI-generated improvement recommendations
- [ ] WebSocket-based live evaluation updates
- [ ] Automated CI/CD
- [ ] Docker-based deployment

---

## Contributing

Contributions are welcome.

### Development Workflow

```bash
git checkout -b feature/<feature-name>

# Make your changes

# Run tests

 git add .
git commit -m "feat: add <feature>"
git push origin feature/<feature-name>
```

Then open a Pull Request.

### Guidelines

- Keep commits focused and descriptive.
- Add tests for important functionality.
- Update documentation when APIs change.
- Never commit secrets.
- Follow the existing project structure.

---

## Project Status

**Version:** `1.1.0`

**Status:** Active Development

Evalify AI is continuously evolving as new evaluation, analytics, and AI capabilities are added.

---

## License

This project is distributed under the **MIT License**.

See [`LICENSE`](./LICENSE) for more information.

---

## Maintainer

**Subha12125**

- GitHub: https://github.com/Subha12125
- Project: https://github.com/Subha12125/Evalify-Ai

---

<div align="center">

### Built with React, Node.js, Supabase & Google Gemini

**Evalify AI — Making automated assessment smarter.**

</div>
