from backend.config import TICKERS, NEWS_LIMIT

from backend.data.news_fetcher import fetch_news_for_ticker, fetch_news_for_keyword
from backend.data.stock_fetcher import get_stock_data

from backend.processing.cleaner import clean_text
from backend.processing.aggregator import aggregate_sentiment
from backend.processing.extractor import extract_companies

from backend.ai.sentiment import get_sentiment
from backend.ai.predictor import predict
from backend.utils.history import save_analysis_history


def analyze_stock(ticker):
    print(f"\nProcessing {ticker}...")

    articles = fetch_news_for_ticker(ticker, NEWS_LIMIT)
    sentiments = []

    for article in articles:
        text = clean_text(article["title"] + " " + article["summary"])
        sentiment = get_sentiment(text)
        sentiments.append(sentiment)

    avg_sentiment = aggregate_sentiment(sentiments)
    price_trend = get_stock_data(ticker)

    result = predict(avg_sentiment, price_trend)

    return {
        "sentiment": float(round(avg_sentiment, 3)),
        "trend": float(round(price_trend, 3)),
        "prediction": result["prediction"],
        "confidence": float(result["confidence"])
    }


# ✅ NEW FUNCTION
def analyze_keyword(keyword):
    print(f"\nSearching for keyword: {keyword}")

    articles = fetch_news_for_keyword(keyword)
    company_mentions = {}

    for article in articles:
        text = clean_text(article["title"] + " " + article["summary"])

        companies = extract_companies(text)
        sentiment = get_sentiment(text)

        for company in companies:
            if company not in company_mentions:
                company_mentions[company] = []

            company_mentions[company].append(sentiment)

    results = {}

    for company, sentiments in company_mentions.items():
        avg_sent = aggregate_sentiment(sentiments)

        results[company] = {
            "mentions": len(sentiments),
            "sentiment": float(round(avg_sent, 3))
        }

    return results


def main():
    user_input = input("Enter stock ticker OR keyword (e.g. AAPL or AI): ").upper()

    if user_input in TICKERS:
        # STOCK MODE
        all_results = {}

        try:
            result = analyze_stock(user_input)
            all_results[user_input] = result
            save_analysis_history({
                "type": "stock",
                "ticker": user_input,
                "data": result
            })
        except Exception as e:
            print(f"Error with {user_input}: {e}")

        print("\n--- FINAL RESULTS ---")

        for ticker, data in all_results.items():
            print(f"\n--- {ticker} ---")
            print(f"Market Sentiment: {data['sentiment']}")
            print(f"Recent Trend: {data['trend']}")
            print(f"Prediction: {data['prediction']}")
            print(f"Confidence: {data['confidence'] * 100:.1f}%")

    else:
        # KEYWORD MODE
        results = analyze_keyword(user_input)
        save_analysis_history({
            "type": "keyword",
            "keyword": user_input,
            "data": results
        })

        print("\n--- KEYWORD RESULTS ---")

        if not results:
            print("No companies found.")
            return

        sorted_results = sorted(results.items(), key=lambda x: x[1]["mentions"], reverse=True)

        for company, data in sorted_results:
            sentiment_label = "Positive" if data['sentiment'] > 0 else "Negative"

            print(f"{company} → Mentions: {data['mentions']}, Sentiment: {sentiment_label} ({data['sentiment']})")


if __name__ == "__main__":
    main()
