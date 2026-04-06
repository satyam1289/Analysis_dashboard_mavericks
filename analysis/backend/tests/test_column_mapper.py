from app.utils.column_mapper import map_columns


def test_column_mapping_basic():
    cols = ["Headline", "Description", "Publish Date", "Source", "Writer", "URL", "Industry", "Brand"]
    mapped = map_columns(cols)
    assert mapped["title"] == "Headline"
    assert mapped["summary"] == "Description"
