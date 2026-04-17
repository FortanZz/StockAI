def extract_companies(text):
    words = text.split()
    companies = []

    for word in words:
        if word.isupper() and 2 <= len(word) <= 5:
            companies.append(word)

    return companies