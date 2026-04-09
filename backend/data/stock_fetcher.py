import yfinance as yf

def get_stock_data(ticker):
    stock = yf.Ticker(ticker)
    hist = stock.history(period="5d")

    if len(hist) < 2:
        return 0

    start = hist["Close"].iloc[0]
    end = hist["Close"].iloc[-1]

    return (end - start) / start