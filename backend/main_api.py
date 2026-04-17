from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.main import analyze_stock, analyze_keyword
from backend.config import TICKERS

app = FastAPI()

# allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/analyze")
def analyze(query: str):
    query = query.upper()

    if query in TICKERS:
        return {
            "type": "stock",
            "ticker": query,
            "data": analyze_stock(query)
        }
    else:
        return {
            "type": "keyword",
            "keyword": query,
            "data": analyze_keyword(query)
        }