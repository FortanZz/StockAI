from transformers import pipeline

sentiment_model = pipeline("sentiment-analysis", device=-1) 

def get_sentiment(text):
    result = sentiment_model(text[:256])[0]  #Shortened the text for better performance

    if result["label"] == "POSITIVE":
        return result["score"]
    else:
        return -result["score"]