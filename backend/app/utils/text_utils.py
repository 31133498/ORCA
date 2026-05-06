import re

def clean_text(text: str) -> str:
    """Remove extra whitespace, normalize quotes."""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def truncate_summary(text: str, max_len: int = 100) -> str:
    if len(text) <= max_len:
        return text
    return text[:max_len-3] + "..."