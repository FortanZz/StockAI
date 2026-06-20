from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.main import analyze_stock, analyze_keyword
from backend.config import TICKERS
from backend.utils.history import save_analysis_history

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

    if query == "NASDAQ":
        results = {}

        for ticker in TICKERS:
            try:
                results[ticker] = analyze_stock(ticker)
            except:
                continue

        result = {
            "type": "nasdaq",
            "data": results
        }

        save_analysis_history(result)
        return result

    # stock mode
    if query in TICKERS:
        result = {
            "type": "stock",
            "ticker": query,
            "data": analyze_stock(query)
        }

        save_analysis_history(result)
        return result

    # keyword mode
    result = {
        "type": "keyword",
        "keyword": query,
        "data": analyze_keyword(query)
    }

    save_analysis_history(result)
    return result
