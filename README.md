<div align="center">

<!-- HERO -->

<a href="https://github.com/Subha12125/Evalify-Ai">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:6366f1,50:8b5cf6,100:06b6d4&height=220&section=header&text=Evalify%20AI&fontSize=62&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=AI-Powered%20Automated%20Answer%20Sheet%20Evaluation&descAlignY=58&descSize=18" width="100%" />
</a>

<br/>

<a href="https://github.com/Subha12125/Evalify-Ai">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=20&duration=3000&pause=1000&color=6366F1&center=true&vCenter=true&width=650&lines=Evaluate+%E2%80%A2+Analyze+%E2%80%A2+Improve;Automated+Assessment+with+Generative+AI;From+Answer+Sheet+to+Structured+Feedback" alt="Typing Animation" />
</a>

<br/><br/>

[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react\&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite\&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=node.js\&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?logo=express\&logoColor=white)](https://expressjs.com/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-AI-4285F4?logo=google\&logoColor=white)](https://ai.google.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase\&logoColor=white)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql\&logoColor=white)](https://www.postgresql.org/)

<br/>

<a href="https://github.com/Subha12125/Evalify-Ai/stargazers">
  <img src="https://img.shields.io/github/stars/Subha12125/Evalify-Ai?style=for-the-badge&logo=github" />
</a>
<a href="https://github.com/Subha12125/Evalify-Ai/network/members">
  <img src="https://img.shields.io/github/forks/Subha12125/Evalify-Ai?style=for-the-badge&logo=github" />
</a>
<a href="https://github.com/Subha12125/Evalify-Ai/issues">
  <img src="https://img.shields.io/github/issues/Subha12125/Evalify-Ai?style=for-the-badge&logo=github" />
</a>

</div>

---

# About Evalify AI

**Evalify AI** is a full-stack intelligent assessment platform designed to automate and simplify student answer-sheet evaluation.

It combines:

* Multimodal Generative AI
* OCR
* Semantic answer analysis
* Rubric-based scoring
* Automated feedback
* Performance analytics
* Human review

into a single assessment workflow.

The system is designed to handle both **handwritten and typed answer sheets**, allowing educators to process individual submissions or evaluate an entire class in a batch.

> **Evalify AI transforms raw answer sheets into structured marks, meaningful feedback, and actionable academic insights.**

---

# The Problem

Traditional answer-sheet evaluation creates several challenges:

```text
Manual Checking
      │
      ├── Time consuming
      ├── Repetitive work
      ├── Difficult to scale
      ├── Limited analytics
      └── Feedback takes time
```

For a large class, an educator may need to manually inspect hundreds of answers while maintaining consistency across different students.

---

# The Solution

Evalify AI introduces an AI-assisted evaluation pipeline:

```text
Student Answer Sheet
          │
          ▼
   Document Processing
          │
          ▼
      OCR / Vision
          │
          ▼
   Question Extraction
          │
          ▼
   Rubric-Based Analysis
          │
          ▼
      Gemini AI
          │
          ▼
   Score + Feedback
          │
          ▼
     Human Review
          │
          ▼
   Final Evaluation
```

The objective is not to replace educators.

The objective is to **reduce repetitive work while keeping educators in control of final decisions**.

---

# Core Features

<table>
<tr>
<td width="50%">

### AI Evaluation

Evaluate student responses using multimodal Generative AI and structured grading criteria.

</td>
<td width="50%">

### Handwritten Recognition

Process scanned handwritten answer sheets using OCR and multimodal vision capabilities.

</td>
</tr>

<tr>
<td>

### Rubric-Based Scoring

Evaluate answers against question-specific criteria rather than relying only on keyword matching.

</td>
<td>

### Batch Processing

Upload multiple answer sheets and process an entire class through a single workflow.

</td>
</tr>

<tr>
<td>

### Performance Analytics

Understand student and question-level performance through structured evaluation data.

</td>
<td>

### Human Review

Allow educators to inspect, modify, and finalize AI-generated results.

</td>
</tr>

<tr>
<td>

### Live Progress

Track long-running evaluation jobs through real-time status polling.

</td>
<td>

### Result Export

Export structured evaluation results into CSV and PDF formats.

</td>
</tr>
</table>

---

# Product Workflow

```text
┌─────────────────────┐
│    Create Exam      │
│                     │
│ Questions           │
│ Marks                │
│ Rubrics              │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Upload Materials    │
│                     │
│ Question Paper      │
│ Rubric              │
│ Answer Sheets       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Document Processing │
│                     │
│ PDF / Image         │
│ OCR                  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   AI Evaluation     │
│                     │
│ Question            │
│ Student Answer      │
│ Rubric              │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Structured Results  │
│                     │
│ Score                │
│ Feedback             │
│ Reasoning            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    Faculty Review   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Analytics & Export  │
└─────────────────────┘
```

---

# AI Evaluation Engine

The core of Evalify AI is the evaluation engine.

Instead of sending an entire answer sheet to an AI model and asking for a final score, the system follows a structured evaluation approach.

```text
                  Evaluation Context
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   Question         Student Answer      Rubric
        │                │                │
        └────────────────┼────────────────┘
                         │
                         ▼
                Multimodal AI Model
                         │
                         ▼
              Semantic Evaluation
                         │
              ┌──────────┼──────────┐
              │          │          │
              ▼          ▼          ▼
            Score     Feedback    Reasoning
```

### Example

```json
{
  "question": "Explain linked list insertion.",
  "maximumMarks": 10,
  "score": 8,
  "feedback": "Good explanation with minor missing details.",
  "reasoning": "The student correctly describes node linking but does not fully explain edge cases."
}
```

The structured result can then be reviewed by a faculty member.

---

# System Architecture

```text
                             ┌─────────────────┐
                             │     Faculty     │
                             │      User       │
                             └────────┬────────┘
                                      │
                                      ▼
                         ┌──────────────────────┐
                         │     React + Vite     │
                         │                      │
                         │ Dashboard            │
                         │ Exam Management      │
                         │ Upload Interface     │
                         │ Analytics             │
                         │ Review                │
                         └──────────┬───────────┘
                                    │
                                    │ REST API
                                    ▼
                         ┌──────────────────────┐
                         │   Node.js + Express  │
                         │                      │
                         │ Authentication       │
                         │ Exam Management      │
                         │ File Processing      │
                         │ Evaluation Engine    │
                         └───────┬───────┬──────┘
                                 │       │
                     ┌───────────┘       └────────────┐
                     ▼                                ▼
          ┌────────────────────┐             ┌──────────────────┐
          │ Supabase           │             │ Google Gemini AI │
          │                    │             │                  │
          │ PostgreSQL         │             │ Vision           │
          │ Storage            │             │ OCR              │
          │ Authentication     │             │ Semantics        │
          └──────────┬─────────┘             │ Evaluation       │
                     │                       └────────┬─────────┘
                     │                                │
                     └──────────────┬─────────────────┘
                                    ▼
                         ┌──────────────────────┐
                         │ Evaluation Results   │
                         │                      │
                         │ Scores               │
                         │ Feedback             │
                         │ Analytics            │
                         │ Review History       │
                         └──────────────────────┘
```

---

# Technology Stack

<div align="center">

### Frontend

<a href="https://react.dev/">
<img src="https://skillicons.dev/icons?i=react" width="60" />
</a>
<a href="https://vitejs.dev/">
<img src="https://skillicons.dev/icons?i=vite" width="60" />
</a>
<a href="https://zustand-demo.pmnd.rs/">
<img src="https://skillicons.dev/icons?i=zustand" width="60" />
</a>

<br/>

**React 18 · Vite · Zustand · React Router · Vanilla CSS**

<br/><br/>

### Backend

<a href="https://nodejs.org/">
<img src="https://skillicons.dev/icons?i=nodejs" width="60" />
</a>
<a href="https://expressjs.com/">
<img src="https://skillicons.dev/icons?i=express" width="60" />
</a>
<a href="https://jwt.io/">
<img src="https://skillicons.dev/icons?i=jwt" width="60" />
</a>

<br/>

**Node.js · Express.js · JWT · Multer**

<br/><br/>

### Database & Infrastructure

<a href="https://supabase.com/">
<img src="https://skillicons.dev/icons?i=supabase" width="60" />
</a>
<a href="https://www.postgresql.org/">
<img src="https://skillicons.dev/icons?i=postgres" width="60" />
</a>

<br/>

**Supabase · PostgreSQL · Supabase Storage**

<br/><br/>

### AI

<img src="https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" />

**Multimodal Generative AI · Semantic Evaluation · Vision**

</div>

---

# Project Structure

```text
Evalify-Ai/
│
├── client/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── ...
│   │
│   ├── package.json
│   └── ...
│
├── server/
│   │
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── utils/
│   ├── uploads/
│   ├── package.json
│   └── ...
│
├── LICENSE
└── README.md
```

---

# Getting Started

## Requirements

Before running Evalify AI locally, install:

| Requirement   | Version |
| ------------- | ------- |
| Node.js       | 18+     |
| npm           | Latest  |
| Supabase      | Project |
| Google Gemini | API Key |

---

## Clone

```bash
git clone https://github.com/Subha12125/Evalify-Ai.git

cd Evalify-Ai
```

---

## Backend

```bash
cd server

npm install
```

Create:

```text
server/.env
```

Configure:

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

---

## Frontend

Open another terminal:

```bash
cd client

npm install
```

Create:

```text
client/.env
```

Configure:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Then open the local URL displayed by Vite.

---

# Environment Variables

### Server

| Variable               | Purpose                  |
| ---------------------- | ------------------------ |
| `PORT`                 | Backend server port      |
| `SUPABASE_URL`         | Supabase project URL     |
| `SUPABASE_SERVICE_KEY` | Server-side Supabase key |
| `GEMINI_API_KEY`       | Gemini API access        |
| `JWT_SECRET`           | JWT signing secret       |
| `CLIENT_URL`           | Frontend application URL |

### Client

| Variable       | Purpose         |
| -------------- | --------------- |
| `VITE_API_URL` | Backend API URL |

> **Never commit `.env` files or credentials to GitHub.**

---

# API Reference

## Authentication

| Method | Endpoint             | Description   |
| ------ | -------------------- | ------------- |
| POST   | `/api/auth/register` | Register user |
| POST   | `/api/auth/login`    | Login user    |

## Exams

| Method | Endpoint             | Description   |
| ------ | -------------------- | ------------- |
| POST   | `/api/exams`         | Create exam   |
| GET    | `/api/exams/:examId` | Retrieve exam |

## Evaluation

| Method | Endpoint                   | Description                     |
| ------ | -------------------------- | ------------------------------- |
| POST   | `/api/evaluate`            | Upload and evaluate submissions |
| GET    | `/api/evaluate/status/:id` | Evaluation progress             |

## Results

| Method | Endpoint                      | Description           |
| ------ | ----------------------------- | --------------------- |
| GET    | `/api/results/:examId`        | Retrieve results      |
| POST   | `/api/results/:examId/review` | Review/update results |

Protected requests use:

```http
Authorization: Bearer <JWT>
```

---

# Data Model

```text
                    ┌─────────────┐
                    │    User     │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │    Exam     │
                    └──────┬──────┘
                           │
                 ┌─────────┴─────────┐
                 ▼                   ▼
          ┌─────────────┐     ┌──────────────┐
          │  Questions  │     │ Submissions  │
          └──────┬──────┘     └──────┬───────┘
                 │                   │
                 │                   ▼
                 │            ┌──────────────┐
                 └───────────►│ Evaluations  │
                              └──────┬───────┘
                                     │
                          ┌──────────┼──────────┐
                          ▼          ▼          ▼
                        Score    Feedback    Reasoning
```

### Main Entities

```text
users
exams
questions
submissions
evaluations
```

---

# Security

Evalify AI is designed with security considerations for academic data.

### Authentication

JWT-based authentication protects application resources.

### Secret Management

Sensitive credentials are stored through environment variables.

### File Validation

Uploaded documents should be validated by:

```text
File Type
   +
File Size
   +
Authentication
   +
Authorization
```

### Data Protection

The system should avoid exposing student answers or personally identifiable information through logs.

### Server-Side Secrets

Supabase service-role credentials and Gemini API keys must remain server-side.

---

# Human-in-the-Loop Design

AI-generated evaluations should not automatically become the final academic decision.

Evalify AI therefore follows:

```text
             AI Evaluation
                   │
                   ▼
            Generated Score
                   │
                   ▼
            Faculty Review
                   │
             ┌─────┴─────┐
             │           │
             ▼           ▼
          Approve      Modify
             │           │
             └─────┬─────┘
                   ▼
             Final Result
```

This approach combines **automation with educator oversight**.

---

# Analytics

Evalify AI can provide structured academic insights such as:

```text
                 CLASS PERFORMANCE
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
   Average Score    Question Stats   Student Stats
        │               │               │
        ▼               ▼               ▼
   Class Trends     Weak Topics     Individual Growth
```

Potential analytics include:

* Average score
* Question-wise performance
* Student performance
* Common mistakes
* Weak concepts
* Score distribution
* Performance trends

---

# Example Result

```text
Student
────────────────────────────────
Name              Student A

Overall Score     82 / 100
Percentage        82%

Question Analysis
────────────────────────────────

Q1    9 / 10
      Correct concept with minor omission.

Q2    7 / 10
      Good explanation but incomplete example.

Q3    10 / 10
      Complete and accurate answer.

Q4    6 / 10
      Core concept understood but implementation
      details are missing.
```

---

# Development Workflow

```text
Developer
    │
    ▼
Feature Branch
    │
    ▼
Implementation
    │
    ▼
Testing
    │
    ▼
Linting
    │
    ▼
Pull Request
    │
    ▼
Code Review
    │
    ▼
Merge
```

Create a feature branch:

```bash
git checkout -b feature/<feature-name>
```

Run tests:

```bash
npm test
```

Commit:

```bash
git add .
git commit -m "feat: add <feature>"
```

Push:

```bash
git push origin feature/<feature-name>
```

---

# Testing

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
  ↓
Processing
  ↓
OCR
  ↓
AI Evaluation
  ↓
Database
  ↓
Results
  ↓
Review
  ↓
Export
```

---

# Deployment Architecture

```text
                         Internet
                            │
                            ▼
                    ┌───────────────┐
                    │   Frontend    │
                    │ React / Vite  │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │    Backend    │
                    │ Node / Express│
                    └───────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              │                           │
              ▼                           ▼
       ┌──────────────┐           ┌──────────────┐
       │   Supabase   │           │ Gemini API   │
       │              │           │              │
       │ PostgreSQL   │           │ AI Evaluation│
       │ Storage      │           │ Vision       │
       └──────────────┘           └──────────────┘
```

For larger deployments, background processing can be introduced using:

```text
Node.js
   │
   ▼
Redis
   │
   ▼
BullMQ
   │
   ▼
Evaluation Workers
   │
   ▼
Gemini API
```

---

# Roadmap

```text
Completed
─────────
✓ Core authentication
✓ Exam management
✓ Answer-sheet upload
✓ AI evaluation flow
✓ Live evaluation status
✓ Result management


Planned
───────
□ Advanced OCR preprocessing
□ Improved handwriting recognition
□ Background evaluation workers
□ Redis + BullMQ
□ Question confidence scoring
□ Advanced analytics
□ Custom teacher rubrics
□ Student performance history
□ AI improvement recommendations
□ WebSocket-based live updates
□ Docker deployment
□ Automated CI/CD
```

---

# Project Status

<div align="center">

<img src="https://img.shields.io/badge/Version-1.1.0-6366F1?style=for-the-badge" />
<img src="https://img.shields.io/badge/Status-Active%20Development-22C55E?style=for-the-badge" />

</div>

Evalify AI is currently under active development.

The architecture and features may evolve as the platform grows.

---

# Contributing

Contributions are welcome.

### Guidelines

* Keep commits focused.
* Use descriptive commit messages.
* Add tests for important changes.
* Update documentation when APIs change.
* Never commit secrets.
* Follow the existing project structure.

---

# License

This project is distributed under the **MIT License**.

See [`LICENSE`](LICENSE) for details.

---

# Maintainer

<div align="center">

### Subha12125

<a href="https://github.com/Subha12125">
<img src="https://img.shields.io/badge/GitHub-Subha12125-181717?style=for-the-badge&logo=github" />
</a>

<br/><br/>

<a href="https://github.com/Subha12125/Evalify-Ai">
<img src="https://img.shields.io/badge/View%20Repository-Evalify%20AI-6366F1?style=for-the-badge&logo=github" />
</a>

</div>

---

<div align="center">

<a href="https://github.com/Subha12125/Evalify-Ai">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:06b6d4,50:8b5cf6,100:6366f1&height=140&section=footer" width="100%" />
</a>

### Evalify AI

**Intelligent assessment. Structured evaluation. Better insights.**

Built with React · Node.js · Supabase · Google Gemini

</div>
