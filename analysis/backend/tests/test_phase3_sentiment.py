from app.workers.phase3_sentiment import _label


def test_sentiment_label():
    assert _label(0.06) == "positive"
    assert _label(-0.06) == "negative"
    assert _label(0.0) == "neutral"
