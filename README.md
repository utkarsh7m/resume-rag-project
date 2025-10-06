# ResumeRAG: AI-Powered Resume Analysis & Matching

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![LangChain](https://img.shields.io/badge/langchain-%23000000.svg?style=for-the-badge&logo=langchain)

**An intelligent application designed to search, query, and match candidates from a pool of resumes using a local-first AI model.**

---

## 📜 Table of Contents
* [Problem Statement](#-problem-statement)
* [Features](#-features)
* [Technology Stack](#-technology-stack)
* [API Endpoints](#-api-endpoints)
* [Local Setup & Installation](#-local-setup--installation)
* [Deployment](#-deployment)

---

## 🎯 Problem Statement

In modern recruitment, manually screening hundreds of resumes is time-consuming and prone to overlooking qualified candidates. `ResumeRAG` solves this by providing an intelligent platform where recruiters can upload multiple resumes and use natural language to find information and match candidates against complex job requirements instantly.

---

## ✨ Features

This project implements the full scope of the hackathon challenge, including several advanced features for robustness and user experience.

#### 🧠 AI Core
* **Semantic Q&A**: Ask complex, natural language questions (e.g., "Who has experience with cloud services and Python?") and receive precise, evidence-backed snippets from all uploaded resumes, ranked by relevance.
* **AI-Powered Gap Analysis**: Automatically match resumes against a job description. The system generates a ranked list of the best candidates and, for each one, highlights their **✅ Matching Skills** and **❌ Missing Skills**.
* **Local-First AI**: The core skill-extraction LLM (`FLAN-T5`) runs entirely on the server, requiring no external paid API keys, ensuring privacy and cost-effectiveness.

#### ⚙️ Core Functionality
* **Multi-File Ingestion**: Supports uploading multiple PDF files at once, as well as **ZIP archives** for bulk processing.
* **Multi-Page UI**: A clean, responsive, and animated user interface built with React Router, featuring dedicated pages for Q&A, Job Matching, and project information.

#### 🛡️ Robust & Secure Engineering
* **PII Redaction**: Automatically finds and redacts sensitive Personally Identifiable Information (names, emails, phone numbers) from query results to protect candidate privacy.
* **Asynchronous Backend**: The FastAPI backend is fully asynchronous, using background threads to handle heavy AI processing, ensuring the UI remains fast and responsive.
* **API Safeguards**: The API is protected with **Rate Limiting** (e.g., 60 requests/minute) to prevent abuse.
* **Idempotent Uploads**: The file upload endpoint uses an `Idempotency-Key` to prevent accidental duplicate processing of the same file.
* **Paginated API**: The `GET /api/resumes` endpoint is paginated to efficiently handle a large number of resumes.

---

## 🛠️ Technology Stack

| Category      | Technology                                    | Purpose                                                 |
| :------------ | :-------------------------------------------- | :------------------------------------------------------ |
| **Frontend** | React, Vite, React Router, Framer Motion      | Building a fast, modern, and animated user interface.   |
| **Backend** | Python, FastAPI                               | Creating a high-performance, asynchronous API server.   |
| **AI/ML** | LangChain                                     | Orchestrating the entire RAG pipeline.                  |
|               | Hugging Face Transformers (`FLAN-T5`)         | For local, free, AI-powered skill extraction.           |
|               | Sentence-Transformers                         | Generating semantic embeddings for text.                |
|               | Microsoft Presidio                            | For robust PII detection and redaction.                 |
| **Database** | ChromaDB                                      | As a vector database to store and search embeddings.    |
| **API Tools** | `slowapi`                                     | Implementing rate limiting on the backend.              |

---

## 🔌 API Endpoints

| Method   | Path                               | Description                                         |
| :------- | :--------------------------------- | :-------------------------------------------------- |
| `POST`   | `/api/resumes`                     | Upload a single PDF or a ZIP file of PDFs.          |
| `GET`    | `/api/resumes`                     | Get a paginated list of uploaded resume filenames.  |
| `POST`   | `/api/jobs`                        | Create a new job posting.                           |
| `GET`    | `/api/jobs/{job_id}`               | Get the description of a specific job.              |
| `POST`   | `/api/jobs/{job_id}/match`         | Run the Gap Analysis for a job against all resumes. |
| `POST`   | `/api/ask`                         | Ask a natural language question to the knowledge base. |

---

## 💻 Local Setup & Installation

Follow these steps to run the project on your local machine.

### Prerequisites
* Python 3.9+
* Node.js 18+ and npm

### 1. Clone the Repository
```bash
git clone https://[YOUR_GITHUB_REPO_URL]
cd resume-rag-project
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
pip install -r requirements.txt
python -m spacy download en_core_web_lg
uvicorn main:app --reload
```
The backend will be running at `http://127.0.0.1:8000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will be running at `http://localhost:5173`.

---

## ☁️ Deployment

* The **Backend** is deployed on **Railway**, utilizing persistent volumes to store the uploaded resumes and the ChromaDB vector database.
* The **Frontend** is deployed on **Vercel**, configured to communicate with the live backend service.
