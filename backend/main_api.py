from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.main import analyze_stock, analyze_keyword
from backend.config import TICKERS

app = FastAPI()

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

    # 🧠 NASDAQ MODE (NEW)
    if query == "NASDAQ":
        results = {}

        for ticker in TICKERS:
            try:
                results[ticker] = analyze_stock(ticker)
            except:
                continue

        return {
            "type": "nasdaq",
            "data": results
        }

    # stock mode
    if query in TICKERS:
        return {
            "type": "stock",
            "ticker": query,
            "data": analyze_stock(query)
        }

    # keyword mode
    return {
        "type": "keyword",
        "keyword": query,
        "data": analyze_keyword(query)
    }