def aggregate_sentiment(sentiments):
    if not sentiments:
        return 0
    return sum(sentiments) / len(sentiments)