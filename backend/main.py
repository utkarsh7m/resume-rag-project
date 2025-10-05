import os
import shutil
import zipfile
import io
from fastapi import FastAPI, UploadFile, File, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import chromadb
from fastapi.concurrency import run_in_threadpool

from transformers import pipeline
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine

app = FastAPI()

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

UPLOADS_DIR = "uploads"
CHROMA_PERSIST_DIR = "chroma_db"
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
vectorstore = Chroma(client=client, collection_name="resume_rag", embedding_function=embeddings)

print("Loading local models...")
skill_extractor = pipeline("text2text-generation", model="google/flan-t5-base", max_length=100)
pii_analyzer = AnalyzerEngine()
pii_anonymizer = AnonymizerEngine()
print("Models loaded successfully.")

jobs_db = {}
job_id_counter = 1
idempotency_keys = set()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Job(BaseModel): description: str
class MatchRequest(BaseModel): top_n: int = 3
class Query(BaseModel): text: str

def process_pdf(file_path: str):
    loader = PyPDFLoader(file_path)
    documents = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = text_splitter.split_documents(documents)
    vectorstore.add_documents(chunks)
    vectorstore.persist()

def redact_text(text: str) -> str:
    analyzer_results = pii_analyzer.analyze(text=text, language='en')
    anonymized_text = pii_anonymizer.anonymize(text=text, analyzer_results=analyzer_results)
    return anonymized_text.text

@app.get("/")
@limiter.limit("60/minute")
def read_root(request: Request):
    return {"message": "ResumeRAG API is running!"}

@app.post("/api/resumes")
@limiter.limit("30/minute")
async def upload_resume_and_process(request: Request, file: UploadFile = File(...), idempotency_key: Optional[str] = Header(None)):
    if idempotency_key:
        if idempotency_key in idempotency_keys:
            return {"message": "Duplicate request."}
        idempotency_keys.add(idempotency_key)
    
    filenames = []
    if file.content_type == 'application/zip':
        zip_buffer = io.BytesIO(await file.read())
        with zipfile.ZipFile(zip_buffer, 'r') as zip_ref:
            for zip_info in zip_ref.infolist():
                filename = os.path.basename(zip_info.filename)
                if filename.lower().endswith('.pdf') and not zip_info.is_dir():
                    with zip_ref.open(zip_info) as pdf_file:
                        file_path = os.path.join(UPLOADS_DIR, filename)
                        with open(file_path, "wb") as buffer:
                            buffer.write(pdf_file.read())
                        await run_in_threadpool(process_pdf, file_path=file_path)
                        filenames.append(filename)
    elif file.content_type == 'application/pdf':
        filename = os.path.basename(file.filename)
        file_path = os.path.join(UPLOADS_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        await run_in_threadpool(process_pdf, file_path=file_path)
        filenames.append(filename)
    else:
        return {"error": "Unsupported file type."}
    
    return {"filenames": filenames, "message": f"{len(filenames)} file(s) are being processed."}

@app.get("/api/resumes")
@limiter.limit("60/minute")
def get_uploaded_resumes(request: Request, limit: int = 10, offset: int = 0):
    all_files = sorted(os.listdir(UPLOADS_DIR))
    paginated_files = all_files[offset : offset + limit]
    next_offset = offset + len(paginated_files)
    if next_offset >= len(all_files):
        next_offset = None
    return {"items": paginated_files, "next_offset": next_offset}

@app.post("/api/jobs")
@limiter.limit("60/minute")
def create_job(request: Request, job: Job):
    global job_id_counter
    job_id = job_id_counter
    jobs_db[job_id] = job.description
    job_id_counter += 1
    return {"job_id": job_id, "description": job.description}

@app.get("/api/jobs/{job_id}")
@limiter.limit("60/minute")
def get_job(request: Request, job_id: int):
    if job_id not in jobs_db:
        return {"error": "Job not found"}
    return {"job_id": job_id, "description": jobs_db[job_id]}

@app.post("/api/jobs/{job_id}/match")
@limiter.limit("30/minute")
async def match_resumes_to_job(request: Request, job_id: int, match_request: MatchRequest):
    if job_id not in jobs_db:
        return {"error": "Job not found"}
    job_description = jobs_db[job_id]

    def _match_sync():
        prompt = f"""From the following job description, list the most important technical skills. Return only a comma-separated list of keywords.\n\nJob Description:\n{job_description}"""
        try:
            extracted_skills_output = skill_extractor(prompt)
            skill_keywords_str = extracted_skills_output[0]['generated_text']
            cleaned_skills_str = skill_keywords_str.replace("Skills:", "").replace("*", "").replace("-", "").strip()
            required_skills = [skill.strip() for skill in cleaned_skills_str.split(',')]
            required_skills = [skill for skill in required_skills if skill]
        except Exception as e:
            return {"error": f"Could not extract skills from job description: {e}"}

        top_docs = vectorstore.similarity_search(job_description, k=20)
        resume_scores = {}
        for doc in top_docs:
            source = os.path.basename(doc.metadata.get('source', 'Unknown'))
            resume_scores[source] = resume_scores.get(source, 0) + 1
        
        sorted_resumes = sorted(resume_scores.items(), key=lambda item: item[1], reverse=True)
        all_uploaded_resumes = os.listdir(UPLOADS_DIR)
        top_candidates = [resume for resume, score in sorted_resumes if resume in all_uploaded_resumes][:match_request.top_n]

        match_results = []
        for candidate_resume in top_candidates:
            matching_skills, missing_skills = [], []
            source_path = os.path.join(UPLOADS_DIR, candidate_resume)
            if not os.path.exists(source_path): continue
            candidate_docs_result = vectorstore.get(where={"source": source_path})
            candidate_text = " ".join(candidate_docs_result['documents'])
            for skill in required_skills:
                if skill.lower() in candidate_text.lower():
                    matching_skills.append(skill)
                else:
                    missing_skills.append(skill)
            
            match_percentage = (len(matching_skills) / len(required_skills)) * 100 if required_skills else 0
            match_results.append({
                "candidate": candidate_resume, "match_percentage": round(match_percentage),
                "relevance_score": resume_scores.get(candidate_resume, 0),
                "matching_skills": matching_skills, "missing_skills": missing_skills
            })
        match_results.sort(key=lambda x: x['match_percentage'], reverse=True)
        return {"results": match_results, "required_skills": required_skills}

    return await run_in_threadpool(_match_sync)

@app.post("/api/ask")
@limiter.limit("60/minute")
async def ask_question(request: Request, query: Query): # Simplified: removed source_file
    def _ask_sync():
        search_kwargs = {'k': 5}
        # Simplified: removed the filter logic
        scored_docs = vectorstore.similarity_search_with_relevance_scores(query.text, **search_kwargs)
        results = []
        for doc, score in scored_docs:
            redacted_snippet = redact_text(doc.page_content)
            result = {"snippet": redacted_snippet, "source": os.path.basename(doc.metadata.get('source', 'Unknown')), "score": score}
            results.append(result)
        return {"results": results}

    return await run_in_threadpool(_ask_sync)