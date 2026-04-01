from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

import os
import uuid
import random
import re

# ✅ NEW ADDITIONS
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
USE_OLLAMA = False  # change to False when deploying

from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_ollama import ChatOllama
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

# ✅ NEW: SENTIMENT IMPORT
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer


DB_PATH = "embeddings"
DATA_PATH = "data"


# ===============================
# EMBEDDINGS
# ===============================

embedding_function = SentenceTransformerEmbeddings(
    model_name="all-MiniLM-L6-v2"
)


# ===============================
# SENTIMENT ANALYZER (NEW)
# ===============================

analyzer = SentimentIntensityAnalyzer()

# ===============================
# 🔥 DASHBOARD STORAGE (NEW)
# ===============================

dashboard_data = {
    "stress": 0,
    "headache": 0,
    "sleep": 0,
    "messages": 0,
    "positive": 0,
    "negative": 0
}

# ===============================
# 🔥 HEALTH SCORE CALCULATION
# ===============================

def calculate_health_score():

    score = 100

    score -= dashboard_data["stress"] * 2
    score -= dashboard_data["headache"] * 2
    score -= dashboard_data["sleep"] * 2
    score -= dashboard_data["negative"] * 3

    return max(score, 0)


# ===============================
# 🔥 ALERT SYSTEM
# ===============================

def generate_alerts():

    alerts = []

    if dashboard_data["stress"] > 3:
        alerts.append("⚠️ High stress detected")

    if dashboard_data["sleep"] > 2:
        alerts.append("😴 Sleep issues increasing")

    if dashboard_data["negative"] > 5:
        alerts.append("💔 Mood seems low")

    return alerts


# ===============================
# CLEAN CONTEXT (ANTI-INJECTION)
# ===============================

def clean_context(text):

    bad_patterns = [
        "You are", "Rules:", "Reply:", "Previous conversation",
        "Your response must", "AI with", "assistant",
        "do not repeat", "must be", "respond in"
    ]

    for pattern in bad_patterns:
        text = text.replace(pattern, "")

    return text.strip()


# ===============================
# ADDITION: STRONG FILTER
# ===============================

def filter_context(text):

    bad_phrases = [
        "in this response",
        "the assistant",
        "this response",
        "demonstrates",
        "the model",
        "rag",
        "retrieval",
        "instruction",
        "should",
        "must",
        "follow-up question",
        "tone",
        "style",
        "example response",
        "analysis"
    ]

    lines = text.split("\n")
    clean_lines = []

    for line in lines:
        lower = line.lower()

        if not any(bad in lower for bad in bad_phrases):
            clean_lines.append(line)

    return " ".join(clean_lines)


# ===============================
# ADDITION: TEXT NORMALIZATION
# ===============================

def normalize_text(text):

    text = text.lower()

    replacements = {
        "buddies": "body aches",
        "body ache": "body aches",
        "feaver": "fever",
        "temprature": "temperature"
    }

    for k, v in replacements.items():
        text = text.replace(k, v)

    return text


# ===============================
# ADDITION: INTENT DETECTION
# ===============================

def detect_intent(text):

    text = text.lower()

    if any(word in text for word in ["fever","pain","headache","sick","temperature"]):
        return "medical"

    if any(word in text for word in ["i meant","not with me","what i meant","clarify"]):
        return "clarification"

    return "casual"


# ===============================
# ADDITION: TEMPERATURE LOGIC
# ===============================

def extract_temperature(text):

    match = re.search(r'(\d{2,3})', text)

    if match:
        return int(match.group(1))

    return None


def classify_temperature(temp):

    if temp is None:
        return "unknown"

    if temp < 99:
        return "normal"

    elif 99 <= temp < 100.4:
        return "mild"

    elif 100.4 <= temp < 102:
        return "moderate"

    else:
        return "high"


# ===============================
# VECTOR DATABASE
# ===============================

def build_vector_store():

    documents = []

    for file in os.listdir(DATA_PATH):

        if file.endswith(".txt"):

            loader = TextLoader(
                os.path.join(DATA_PATH, file),
                encoding="utf-8"
            )

            documents.extend(loader.load())

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )

    split_docs = splitter.split_documents(documents)

    db = Chroma.from_documents(
        split_docs,
        embedding_function,
        persist_directory=DB_PATH
    )

    db.persist()

    return db


if not os.path.exists(DB_PATH) or not os.listdir(DB_PATH):

    db = build_vector_store()

else:

    db = Chroma(
        persist_directory=DB_PATH,
        embedding_function=embedding_function
    )


retriever = db.as_retriever(search_kwargs={"k":3})


# ===============================
# LLM
# ===============================

llm = ChatOllama(
    model="phi3",
    temperature=0.35
)

# ✅ NEW FUNCTION
def get_llm_response(prompt):

    if USE_OLLAMA:
        response = llm.invoke(prompt)
        return response.content

    else:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}]
        )

        return response.choices[0].message.content


# ===============================
# FASTAPI
# ===============================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Query(BaseModel):
    message: str
    conversation_id: str | None = None


# ===============================
# MEMORY STORE
# ===============================

conversation_store = {}


def get_memory(cid):

    if cid not in conversation_store:
        conversation_store[cid] = []

    return conversation_store[cid]


def add_memory(memory, user, bot):

    memory.append({
        "user": user,
        "bot": bot
    })

    if len(memory) > 6:
        memory.pop(0)


def build_memory_context(memory):

    text = ""

    for m in memory[-3:]:
        text += f"{m['user']} {m['bot']} "

    return text.strip()


# ===============================
# CLEAN RESPONSE
# ===============================

def clean_response(text):

    prefixes = ["Assistant:", "AI:", "Bot:"]

    for p in prefixes:
        if text.startswith(p):
            text = text.replace(p, "", 1)

    return text.strip()


# ===============================
# MEDICAL KEYWORDS
# ===============================

medical_keywords = [
    "headache","pain","stomach","dizzy","sleep",
    "stress","anxiety","vomit","fever","sick",
    "health","symptom","tired","dehydration"
]


def detect_medical(text):

    text = text.lower()

    for word in medical_keywords:
        if word in text:
            return True

    return False


# ===============================
# TRIAGE QUESTIONS
# ===============================

triage_questions = {

    "fever": [
        "Do you also have chills or body aches?",
        "Have you checked your temperature?",
        "Are you feeling tired or weak as well?"
    ],

    "headache": [
        "Has it been there all day?",
        "Have you been on screens a lot?",
        "Did you drink enough water today?"
    ],

    "stress": [
        "Is it mainly from assignments?",
        "Have you been sleeping well?"
    ]
}


# ===============================
# CHAT ENDPOINT
# ===============================

@app.post("/chat")
def chat(query: Query):

    user_message = query.message
    normalized_message = normalize_text(user_message)

    dashboard_data["messages"] += 1

    if "stress" in normalized_message:
        dashboard_data["stress"] += 1

    if "headache" in normalized_message:
        dashboard_data["headache"] += 1

    if "sleep" in normalized_message:
        dashboard_data["sleep"] += 1

    sentiment_scores = analyzer.polarity_scores(user_message)

    if sentiment_scores['compound'] >= 0.05:
        mood = "positive"
        dashboard_data["positive"] += 1

    elif sentiment_scores['compound'] <= -0.05:
        mood = "negative"
        dashboard_data["negative"] += 1

    else:
        mood = "neutral"


    if not user_message:
        return {"reply": "Please type a message."}

    conversation_id = query.conversation_id or str(uuid.uuid4())

    memory = get_memory(conversation_id)

    memory_context = build_memory_context(memory)

    style = random.choice([
        "Respond naturally.",
        "Respond warmly.",
        "Respond like a friendly assistant.",
        "Respond calmly.",
    ])

    intent = detect_intent(user_message)

    medical_mode = detect_medical(user_message)

    triage_followup = None

    for key in triage_questions:
        if key in normalized_message:
            triage_followup = random.choice(triage_questions[key])
            break


    temp = extract_temperature(normalized_message)
    temp_level = classify_temperature(temp)


    if medical_mode or intent == "medical":

        docs = retriever.invoke(user_message)

        context = "\n".join([
            filter_context(clean_context(doc.page_content[:300]))
            for doc in docs
        ])

        prompt = f"""
You are a caring student health assistant.

Previous conversation:
{memory_context}

Context:
{context}

User:
{user_message}

Rules:
- Be empathetic
- Give helpful advice
- Ask ONE follow-up question
- Sound natural

Reply:
"""

        answer = clean_response(get_llm_response(prompt))

        if temp_level == "high":
            answer += " This temperature is quite high—please consider seeing a doctor."

        if not triage_followup:
            triage_followup = "How have you been feeling otherwise?"

        answer += " " + triage_followup


    elif intent == "clarification":

        prompt = f"""
The user is correcting themselves.

Previous conversation:
{memory_context}

User:
{user_message}

- Understand the correction properly
- Respond accordingly
- Keep it natural and friendly

Reply:
"""

        answer = clean_response(get_llm_response(prompt))


    else:

        prompt = f"""
You are a friendly and thoughtful AI companion.

Previous conversation:
{memory_context}

User:
{user_message}

Rules:
- Understand the question carefully
- Answer directly (no assumptions)
- Then be warm and natural
- Avoid generic or unrelated replies
- Keep it short

Reply:
"""

        answer = clean_response(get_llm_response(prompt))


    add_memory(memory, user_message, answer)

    return {
        "reply": answer,
        "sentiment": mood,
        "conversation_id": conversation_id
    }


# ===============================
# DASHBOARD API
# ===============================

@app.get("/dashboard")
def get_dashboard():

    return {
        "health_score": calculate_health_score(),
        "stress_mentions": dashboard_data["stress"],
        "headaches": dashboard_data["headache"],
        "sleep_issues": dashboard_data["sleep"],
        "messages": dashboard_data["messages"],
        "positive": dashboard_data["positive"],
        "negative": dashboard_data["negative"],
        "alerts": generate_alerts()
    }