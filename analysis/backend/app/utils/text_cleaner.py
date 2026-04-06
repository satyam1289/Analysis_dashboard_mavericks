import re


def clean_text(text: str | None) -> str | None:
    if not text or not isinstance(text, str):
        return None
    text = re.sub(r"^\s*[\*\-\•]\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"\s+", " ", text).strip()
    text = text.encode("utf-8", errors="ignore").decode("utf-8")
    return text if len(text) > 3 else None
