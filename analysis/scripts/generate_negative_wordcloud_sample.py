import random
import pandas as pd


def main():
    random.seed(1)
    terms = [
        "AI",
        "machine",
        "learning",
        "model",
        "dataset",
        "inference",
        "cloud",
        "security",
        "compute",
        "platform",
        "revenue",
        "decline",
        "loss",
        "latency",
        "accuracy",
        "training",
        "pipeline",
        "strategy",
        "market",
        "customers",
        "automation",
        "analytics",
        "software",
        "product",
        "network",
        "systems",
        "governance",
        "policy",
        "research",
        "innovation",
    ]

    rows = []
    for i in range(200):
        sample = random.sample(terms, 6)
        # Use clearly negative sentiment language.
        text = (
            "has, with, for, and, in the "
            + " ".join(sample)
            + " losses widen weak outlook declines are expected"
        )
        rows.append(
            {
                "headline": f"Tech headline {i}",
                "description": text,
                "publish date": "2026-03-01",
                "source": "reuters.com",
                "writer": "John Doe",
                "url": f"https://example.com/{i}",
                "industry": "Technology",
                "brand": "Acme",
            }
        )

    df = pd.DataFrame(rows)
    df.to_csv("sample_negative_wordcloud_test.csv", index=False)
    print("wrote", len(df))


if __name__ == "__main__":
    main()

