def is_excluded_author(name: str | None) -> bool:
    """No filtering — return all authors as-is from the database."""
    if not name or not name.strip():
        return True
    return False
