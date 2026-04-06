import random
import pandas as pd


def main():
    random.seed(0)
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
        "growth",
        "profit",
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
    for i in range(300):
        sample = random.sample(terms, 6)
        # Include common English filler words; TF-IDF stopwords should remove them.
        text = "has, with, for, and, in the " + " ".join(sample) + " growth profits are expected"
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
    df.to_csv("sample_wordcloud_test.csv", index=False)
    print("wrote", len(df))


if __name__ == "__main__":
    main()

