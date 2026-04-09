def predict(sentiment_score, price_trend):
    score = (sentiment_score * 0.7) + (price_trend * 0.3)

    if score > 0:
        return {
            "prediction": "UP",
            "confidence": round(min(abs(score), 1), 2)
        }
    else:
        return {
            "prediction": "DOWN",
            "confidence": round(min(abs(score), 1), 2)
        }