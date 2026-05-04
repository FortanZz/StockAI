import feedparser

def get_rss_links(ticker):
    return [
        f"https://news.google.com/rss/search?q={ticker}+stock",
        f"https://feeds.finance.yahoo.com/rss/2.0/headline?s={ticker}",
        f"https://news.google.com/rss/search?q={ticker}+stock+site:theeconomist.com"
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

def fetch_news_for_keyword(keyword, limit=10):
    links = [
        f"https://news.google.com/rss/search?q={keyword}",
        f"https://news.google.com/rss/search?q={keyword}+stock"
    ]

    articles = []
    seen_titles = set()

    for link in links:
        feed = feedparser.parse(link)
        for entry in feed.entries[:limit]:
            title = entry.title

            if title in seen_titles:
                continue

            seen_titles.add(title)

            articles.append({
                "title": title,
                "summary": entry.get("summary", "")
            })

    return articles