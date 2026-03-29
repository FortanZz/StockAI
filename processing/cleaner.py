import re

def clean_text(text):
    text = re.sub(r"<.*?>", "", text)  # remove HTML
    text = re.sub(r"[^a-zA-Z0-9\s]", "", text)
    return text.strip()