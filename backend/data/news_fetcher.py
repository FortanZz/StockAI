import feedparser

def get_rss_links(ticker):
    return [
        f"https://news.google.com/rss/search?q={ticker}+stock",
        f"https://feeds.finance.yahoo.com/rss/2.0/headline?s={ticker}"
    ]

def fetch_news_for_ticker(ticker, limit=5):
    articles = []
    feeds = get_rss_links(ticker)

    for link in feeds:
        feed = feedparser.parse(link)
        for entry in feed.entries[:limit]:
            articles.append({
                "title": entry.title,
                "summary": entry.get("summary", "")
            })

    return articles