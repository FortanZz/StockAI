import csv
from datetime import datetime, timezone
from pathlib import Path


HISTORY_DIR = Path("output") / "history"
HISTORY_FILE = HISTORY_DIR / "analysis_history.csv"

HISTORY_FIELDS = [
    "timestamp",
    "query",
    "type",
    "symbol",
    "prediction",
    "confidence",
    "sentiment",
    "trend",
    "mentions",
]


def save_analysis_history(result):
    HISTORY_DIR.mkdir(parents=True, exist_ok=True)

    rows = _history_rows(result)
    if not rows:
        return

    should_write_header = not HISTORY_FILE.exists() or HISTORY_FILE.stat().st_size == 0

    with HISTORY_FILE.open("a", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=HISTORY_FIELDS)

        if should_write_header:
            writer.writeheader()

        writer.writerows(rows)


def _history_rows(result):
    timestamp = datetime.now(timezone.utc).isoformat(timespec="seconds")
    result_type = result.get("type", "")

    if result_type == "stock":
        data = result.get("data", {})
        ticker = result.get("ticker", "")

        return [
            {
                "timestamp": timestamp,
                "query": ticker,
                "type": result_type,
                "symbol": ticker,
                "prediction": data.get("prediction", ""),
                "confidence": data.get("confidence", ""),
                "sentiment": data.get("sentiment", ""),
                "trend": data.get("trend", ""),
                "mentions": "",
            }
        ]

    if result_type == "nasdaq":
        rows = []

        for ticker, data in result.get("data", {}).items():
            rows.append(
                {
                    "timestamp": timestamp,
                    "query": "NASDAQ",
                    "type": result_type,
                    "symbol": ticker,
                    "prediction": data.get("prediction", ""),
                    "confidence": data.get("confidence", ""),
                    "sentiment": data.get("sentiment", ""),
                    "trend": data.get("trend", ""),
                    "mentions": "",
                }
            )

        return rows

    if result_type == "keyword":
        keyword = result.get("keyword", "")
        rows = []

        for company, data in result.get("data", {}).items():
            rows.append(
                {
                    "timestamp": timestamp,
                    "query": keyword,
                    "type": result_type,
                    "symbol": company,
                    "prediction": "",
                    "confidence": "",
                    "sentiment": data.get("sentiment", ""),
                    "trend": "",
                    "mentions": data.get("mentions", ""),
                }
            )

        return rows

    return []
