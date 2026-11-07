from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import ChatRequest, ChatResponse
from app.services.knowledge_base import retrieve_documents
from app.services.gemini_service import generate_answer
from app.config import settings

app = FastAPI(
    title="Ask Ajil API",
    description="Personal AI Portfolio Assistant",
    version="1.0.0"
)


# Allow our local React frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_origin,
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"]
)


@app.get("/api/health")
def health_check():

    return {
        "status": "healthy",
        "application": "Ask Ajil"
    }


@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):

    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty"
        )

    try:

        # Step 1: Retrieve relevant information
        documents = retrieve_documents(question)

        # Step 2: Generate an answer using Gemini
        answer = generate_answer(
            question,
            documents
        )

        # Step 3: Extract source document titles
        sources = [
            document["title"]
            for document in documents
        ]

        # Step 4: Return the response
        return ChatResponse(
            question=question,
            answer=answer,
            sources=sources
        )

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="The AI service is temporarily unavailable. Please try again."
        )