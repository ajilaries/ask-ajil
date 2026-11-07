
import json
import re

from pathlib import Path


# Locate the knowledge base JSON file
BASE_DIR = Path(__file__).resolve().parents[2]

KNOWLEDGE_BASE_PATH = BASE_DIR / "data" / "knowledge_base.json"


# Common words that usually don't help with retrieval
STOP_WORDS = {
    "a", "an", "the", "is", "are", "was", "were",
    "am", "i", "me", "my", "he", "his", "she",
    "they", "and", "or", "to", "of", "in", "on",
    "for", "with", "about", "tell", "what", "who",
    "how", "does", "do", "did", "can", "could",
    "has", "have", "had", "please", "give"
}
CATEGORY_INTENT = {

    "profile": {
        "profile", "introduction", "background",
        "journey", "hobbies", "interests"
    },

    "education": {
        "education", "degree", "college",
        "university", "school", "studied",
        "bca", "sslc"
    },

    "experience": {
        "experience", "internship", "intern",
        "employment", "career", "job",
        "training", "tcs", "ignite"
    },

    "project": {
        "project", "projects", "built",
        "developed", "application", "applications"
    },

    "skills": {
        "skill", "skills", "technology",
        "technologies", "tech", "stack",
        "programming", "frameworks", "languages"
    },

    "career": {
        "goals", "future", "aspirations",
        "engineering", "engineer", "llm",
        "agentic", "cloud", "ambition"
    },

    "certification": {
        "certification", "certifications",
        "certificate", "certificates",
        "credentials", "course"
    },

    "achievement": {
        "achievement", "achievements",
        "award", "awards", "recognition"
    },

    "social": {
        "linkedin", "github", "instagram",
        "social", "profiles", "profile"
    },

    "contact": {
        "contact", "email", "connect",
        "collaboration", "hire"
    }
}

def load_documents():

    if not KNOWLEDGE_BASE_PATH.exists():
        raise FileNotFoundError(
            f"Knowledge base not found: {KNOWLEDGE_BASE_PATH}"
        )

    with open(KNOWLEDGE_BASE_PATH, "r", encoding="utf-8") as file:
        data = json.load(file)

    documents = data.get("documents", [])

    if not isinstance(documents, list):
        raise ValueError("The documents field must be a list")

    return documents


def tokenize(text):

    words = re.findall(r"\b[a-zA-Z0-9+#.]+\b", text.lower())

    return {
        word for word in words
        if word not in STOP_WORDS and len(word) > 1
    }



def retrieve_documents(query, top_k=3):

    if not query or not query.strip():
        return []

    query_tokens = tokenize(query)

    if not query_tokens:
        return []

    # Step 1: Identify query intent
    intended_categories = {
        category
        for category, markers in CATEGORY_INTENT.items()
        if query_tokens.intersection(markers)
    }

    # Ignore the person's name when another category
    # clearly indicates what information is requested.
    search_tokens = query_tokens.copy()

    if intended_categories:
        search_tokens.discard("ajil")

    documents = load_documents()

    results = []

    # Step 2: Search through documents
    for document in documents:

        title = document.get("title", "")
        content = document.get("content", "")
        keywords = document.get("keywords", [])
        category = document.get("category", "")

        title_tokens = tokenize(title)
        content_tokens = tokenize(content)

        keyword_tokens = set()

        for keyword in keywords:
            keyword_tokens.update(tokenize(keyword))

        # Step 3: Calculate lexical matching scores
        title_matches = search_tokens & title_tokens
        keyword_matches = search_tokens & keyword_tokens
        content_matches = search_tokens & content_tokens

        lexical_score = (
            len(title_matches) * 3
            + len(keyword_matches) * 2
            + len(content_matches)
        )

        # Ignore documents without an actual text match
        if lexical_score == 0:
            continue

        # Step 4: Apply category-based ranking
        category_bonus = 0

        if category in intended_categories:
            category_bonus = 5

        total_score = lexical_score + category_bonus

        results.append({
            "id": document.get("id"),
            "category": category,
            "title": title,
            "content": content,
            "lexical_score": lexical_score,
            "category_bonus": category_bonus,
            "score": total_score
        })

    # Step 5: Rank documents
    results.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    return results[:top_k]
