<div align="center">

<!-- HERO -->
<a href="https://github.com/Subha12125/AutoGradeAI">
  <img src="client/public/logo.png" width="120" height="120" alt="AutoGrade AI Logo" style="border-radius: 28px; box-shadow: 0 10px 30px rgba(32, 54, 189, 0.25);" />
</a>

<br/><br/>

<a href="https://github.com/Subha12125/AutoGradeAI">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:2563eb,50:4f46e5,100:06b6d4&height=220&section=header&text=AutoGrade%20AI&fontSize=62&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Next-Gen%20Multimodal%20AI%20Exam%20Evaluation%20Platform&descAlignY=58&descSize=18" width="100%" />
</a>

<br/>

<a href="https://github.com/Subha12125/AutoGradeAI">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=20&duration=3000&pause=1000&color=2563EB&center=true&vCenter=true&width=650&lines=Evaluate+%E2%80%A2+Analyze+%E2%80%A2+Empower;Multimodal+AI+Exam+Scoring;Handwritten+OCR+%2B+Step-by-Step+Rubrics;Zero-Latency+SWR+Architecture" alt="Typing Animation" />
</a>

<br/><br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Passing-FCC72B?logo=vitest&logoColor=white)](https://vitest.dev/)

<br/>

<a href="https://github.com/Subha12125/AutoGradeAI/stargazers">
  <img src="https://img.shields.io/github/stars/Subha12125/AutoGradeAI?style=for-the-badge&logo=github" />
</a>
<a href="https://github.com/Subha12125/AutoGradeAI/network/members">
  <img src="https://img.shields.io/github/forks/Subha12125/AutoGradeAI?style=for-the-badge&logo=github" />
</a>
<a href="https://github.com/Subha12125/AutoGradeAI/issues">
  <img src="https://img.shields.io/github/issues/Subha12125/AutoGradeAI?style=for-the-badge&logo=github" />
</a>

<br/><br/>

🌐 **Live Demo**: [https://evalify-ai-tawny.vercel.app](https://evalify-ai-tawny.vercel.app) &nbsp;•&nbsp; ⚡ **API Service**: [https://autogradeai-8xtf.onrender.com](https://autogradeai-8xtf.onrender.com)

</div>

---

## 📖 Overview

**AutoGrade AI** is an enterprise-ready, end-to-end intelligent assessment platform designed to eliminate the manual bottleneck in academic grading. Built for professors, university departments, and academic institutions, AutoGrade AI merges vision multimodal AI, automated rubric alignment, and instant student diagnostic feedback into a cohesive workflow.

Whether processing typed assignments or complex handwritten multi-page mathematical derivations, AutoGrade AI grades papers with objective consistency while keeping educators firmly in control.

> ⏱️ **Reduces grading turnaround time by 80% while providing students with in-depth question-level diagnostic rationale.**

---

## ⚡ Key Highlights & Architecture

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                           AutoGrade AI Pipeline                        │
 ├────────────────────────────────────────────────────────────────────────┤
 │                                                                        │
 │  1. Ingestion        Question Paper (PDF) + Rubric + Student Scans     │
 │                              │                                         │
 │  2. Parsing          pdf-parse (instant text) + Multimodal Vision OCR  │
 │                              │                                         │
 │  3. Alignment        Structured step-marking rubric normalization      │
 │                              │                                         │
 │  4. Evaluation       Google Gemini Flash (Parallel Batch Reasoning)   │
 │                              │                                         │
 │  5. Delivery         Real-Time SSE Streaming + In-Memory SWR Cache     │
 │                              │                                         │
 │  6. Analytics        Exportable CSV/PDF + Interactive Diagnostic Modal │
 │                                                                        │
 └────────────────────────────────────────────────────────────────────────┘
```

- **Zero-Latency Perceived Fetching (SWR)**: Client-side module-level caching and in-memory aggregation eliminate loading spinners when switching between exams or reviews.
- **Multimodal Handwriting Recognition**: Leverages Google Gemini vision models to interpret diagrams, calculations, and freeform handwriting.
- **Dynamic File Staging**: Drag-and-drop document upload queue with real-time file counters and visual validation badges.
- **Uncluttered Results UI**: Streamlined 4-column layout (`Student`, `Score`, `Percentage`, `AI Diagnostic Feedback`) with an interactive modal displaying detailed rubrics and feedback.
- **Optimized Database Layer**: Composite PostgreSQL indexes for Supabase deliver sub-5ms query response times.

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🧠 Multimodal AI Grading
Grades responses against strict step-marking schemes, awarding partial credit and conceptual marks with human-grade precision.

</td>
<td width="50%">

### ✍️ Advanced Handwritten OCR
Transcribes and interprets messy handwriting, equations, symbols, and cross-outs across scanned student answer sheets.

</td>
</tr>
<tr>
<td>

### ⚡ Instant SWR Caching
Instant 0ms tab and exam switching using Stale-While-Revalidate caching, eliminating repetitive database waterfalls.

</td>
<td>

### 🚀 Parallel Batch Processing
Upload dozens of student sheets concurrently. Real-time background workers process batches without blocking the browser.

</td>
</tr>
<tr>
<td>

### 🔍 AI Diagnostic Modal
Inspect complete question breakdowns, individual marks, step feedback, and overall evaluation rationale in a single click.

</td>
<td>

### 📊 In-Memory Analytics & Export
Calculates class averages, highest/lowest scores, and exportable grade books formatted for CSV and printable PDF reports.

</td>
</tr>
<tr>
<td>

### 🛡️ Tiered Quota & Promo Codes
Built-in quota management for Free, Starter, Professional, and Advanced plans with instant promo code activation.

</td>
<td>

### 🔒 Enterprise Security
JWT-based authentication, password hashing with bcrypt, input sanitization, and full PostgreSQL Row-Level Security (RLS).

</td>
</tr>
</table>

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18, Vite, React Router v6
- **Styling**: Tailwind CSS, Vanilla CSS, Material Symbols & Remixicon
- **State Management**: Zustand
- **Animations**: Framer Motion
- **HTTP Client**: Axios with automatic Render cold-start detection & warmup ping
- **Testing**: Vitest + React Testing Library (43 unit & integration tests)

### Backend
- **Runtime**: Node.js 20+ (CommonJS)
- **Framework**: Express 5
- **Multimodal AI**: Google Gemini API (`@google/genai`)
- **PDF Extraction**: `pdf-parse` (instant local parsing)
- **Database Client**: `@supabase/supabase-js` (PostgreSQL)
- **Security**: JWT (`jsonwebtoken`), `bcryptjs`, `helmet`, `cors`, `express-rate-limit`
- **Testing**: Node.js Native Test Runner (25 unit & API integration tests)

### Database & Cloud
- **Database**: Supabase (PostgreSQL with RLS)
- **Hosting**: Vercel (Client) & Render (Server)

---

## 📁 Repository Structure

```text
AutoGradeAI/
│
├── client/                     # Frontend Application (React + Vite)
│   ├── public/                 # Static assets, logo.png, favicons
│   ├── src/
│   │   ├── assets/             # Brand logos & vector artwork
│   │   ├── components/         # Reusable UI components
│   │   │   ├── evaluation/     # StudentDetailModal, ScoreCard, StatusBadge
│   │   │   ├── layout/         # PublicNavbar, Navbar, Sidebar, Footer, Layout
│   │   │   └── ui/             # Button, Spinner, Dropzone
│   │   ├── context/            # ToastContext & Global State
│   │   ├── hooks/              # useAuth, useExam, useQuota, useEvaluation
│   │   ├── pages/              # Landing, Dashboard, CreateExam, Results, Exams, Pricing
│   │   ├── services/           # Axios client & API service modules
│   │   ├── store/              # Zustand stores (examStore, quotaStore)
│   │   └── utils/              # format.js, parser helpers
│   └── tests/                  # 43 Vitest unit & integration test suites
│
├── server/                     # Backend Application (Node.js + Express)
│   ├── src/
│   │   ├── config/             # Supabase client, environment loader
│   │   ├── controllers/        # auth, exam, evaluate, results, quota, analytics
│   │   ├── middleware/         # auth (JWT + cache), errorHandler
│   │   ├── models/             # exam, student, evaluation, result, quota
│   │   ├── routes/             # REST API routing
│   │   ├── services/           # geminiService, evaluationService, pdfService, exportService
│   │   └── utils/              # logger, parser, promptBuilder
│   ├── tests/                  # 25 Node.js test runner unit & integration test suites
│   └── migrations/             # SQL schema migrations
│
├── supabase/                   # Supabase SQL schema & index optimizations
│   ├── migrations/             # Core table migrations
│   └── optimize_indexes.sql    # Composite index script for high query performance
│
├── render.yaml                 # Infrastructure configuration for Render
├── README.md                   # Project documentation
└── LICENSE                     # MIT License
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9+
- **Supabase Account**: A free project on [Supabase](https://supabase.com)
- **Google AI Studio Key**: API key from [Google AI Studio](https://aistudio.google.com)

---

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Subha12125/AutoGradeAI.git
   cd AutoGradeAI
   ```

2. **Configure the Backend Server:**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file inside the `server/` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   
   # Supabase Configuration
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-supabase-service-role-key
   
   # Google Gemini API
   GEMINI_API_KEY=your-gemini-api-key
   
   # Authentication
   JWT_SECRET=your-random-jwt-secret-string
   ```

3. **Configure Database Schema & Indexes:**
   - In your [Supabase Dashboard](https://supabase.com/dashboard), navigate to the **SQL Editor**.
   - Execute the tables migration in `supabase/migrations/001_create_tables.sql`.
   - Execute the quota migration in `server/migrations/002_quota_subscriptions.sql`.
   - Execute the performance index script in `supabase/optimize_indexes.sql`.

4. **Configure the Frontend Client:**
   ```bash
   cd ../client
   npm install
   ```
   Create a `.env` file inside the `client/` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

---

### Running Locally

Start both servers in separate terminals:

```bash
# Terminal 1: Backend Server (runs on http://localhost:5000)
cd server
npm run dev

# Terminal 2: Frontend Web App (runs on http://localhost:5173)
cd client
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Testing Suite

AutoGrade AI comes with a comprehensive test suite across the client and server.

```bash
# Run Client Vitest Suites (43 tests)
cd client
npm test -- --run

# Run Backend Integration & Unit Tests (25 tests)
cd server
npm test

# Run Production Frontend Build
cd client
npm run build
```

---

## 📡 API Endpoints

### Health & Monitoring
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status | Public |
| `GET` | `/api/health/gemini` | Gemini API connectivity check | Public |

### Authentication
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new faculty account | Public |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | Public |

### Exams Management
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/exams` | Get all exams created by faculty | Bearer JWT |
| `POST` | `/api/exams` | Create exam with question paper & rubric | Bearer JWT |
| `GET` | `/api/exams/:id` | Fetch exam metadata | Bearer JWT |
| `DELETE`| `/api/exams/:id` | Delete exam and associated sheets | Bearer JWT |

### Evaluation Engine
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/evaluate` | Upload answer sheets & trigger AI batch evaluation | Bearer JWT |
| `GET` | `/api/evaluate/status/:examId` | Real-time batch evaluation progress | Bearer JWT |

### Results & Insights
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/results/:examId` | Fetch exam results, scores & in-memory statistics | Bearer JWT |
| `GET` | `/api/results/:examId/export?format=csv` | Export results as formatted CSV | Bearer JWT |

### Quotas & Billing
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/quota` | Get user evaluation quota & active plan | Bearer JWT |
| `POST` | `/api/quota/promo` | Apply promo code (e.g. `OPENFREE`) | Bearer JWT |

---

## 🚀 Deployment

### Frontend (Vercel)
The client is configured for Vercel out of the box with `client/vercel.json` rewrites for single-page routing:
- **Build Command**: `cd client && npm run build`
- **Output Directory**: `client/dist`
- **Environment Variable**: `VITE_API_URL=https://autogradeai-8xtf.onrender.com/api`

### Backend (Render)
Configured using `render.yaml`:
- **Build Command**: `cd server && npm install`
- **Start Command**: `cd server && npm start`
- **Health Check Path**: `/api/health`

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**AutoGrade AI** • *Built with ❤️ for modern educators and universities worldwide.*

<br/>

<a href="https://github.com/Subha12125/AutoGradeAI">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:06b6d4,50:4f46e5,100:2563eb&height=120&section=footer" width="100%" />
</a>

</div>
