from config import TICKERS, NEWS_LIMIT

from data.news_fetcher import fetch_news_for_ticker
from data.stock_fetcher import get_stock_data

from processing.cleaner import clean_text
from processing.aggregator import aggregate_sentiment

from ai.sentiment import get_sentiment
from ai.predictor import predict


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


def main():
    user_input = input("Enter stock ticker (or press Enter for all): ").upper()

    if user_input:
        tickers_to_run = [user_input]
    else:
        from config import TICKERS
        tickers_to_run = TICKERS

    all_results = {}

    for ticker in tickers_to_run:
        try:
            result = analyze_stock(ticker)
            all_results[ticker] = result
        except Exception as e:
            print(f"Error with {ticker}: {e}")

    print("\n--- FINAL RESULTS ---")

    for ticker, data in all_results.items():
        print(f"\n--- {ticker} ---")
        print(f"Market Sentiment: {data['sentiment']}")
        print(f"Recent Trend: {data['trend']}")
        print(f"Prediction: {data['prediction']}")
        print(f"Confidence: {data['confidence'] * 100:.1f}%")


if __name__ == "__main__":
    main()