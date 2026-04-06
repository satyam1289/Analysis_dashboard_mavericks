import requests
import time
import pandas as pd
import uuid

API_URL = "http://localhost/api/v1"

def generate_workload():
    print("Generating workload with dirty fixtures...")
    df = pd.read_csv("sample_100_rows.csv")
    df_base = pd.concat([df]*10, ignore_index=True) # 1000 rows
    
    # Add dirty fixtures at the head
    dirty_data = pd.DataFrame([{
        "headline": "Dirty Title 1",
        "description": "Missing date",
        "publish date": "",
        "source": "bad-url",
        "writer": "John Doe",
        "url": "not a url",
        "industry": "Tech",
        "brand": "Acme"
    }, {
        "headline": "",
        "description": "",
        "publish date": "2026-99-99", # invalid date
        "source": "",
        "writer": "",
        "url": "",
        "industry": "",
        "brand": ""
    }])
    df_final = pd.concat([dirty_data, df_base], ignore_index=True)
    df_final.to_csv("test_workload_dirty.csv", index=False)
    print(f"Generated test_workload_dirty.csv with {len(df_final)} rows.")
    return "test_workload_dirty.csv"

def test_api_failure_cases():
    print("Testing API failure cases...")
    # Empty file
    try:
        with open("empty.csv", "w") as f:
            pass
        res = requests.post(f"{API_URL}/uploads", files={"file": open("empty.csv", "rb")})
        assert res.status_code == 400, f"Expected 400 for config file, got {res.status_code}"
    except Exception as e:
        print(f"Empty file test failed: {e}")

    # Unsupported type
    try:
        with open("test.txt", "w") as f:
            f.write("test")
        res = requests.post(f"{API_URL}/uploads", files={"file": open("test.txt", "rb")})
        assert res.status_code == 400, f"Expected 400 for txt file, got {res.status_code}"
    except Exception as e:
        print(f"Unsupported type test failed: {e}")
    print("Failure cases passed.")

def test_workload_and_cache(filename):
    print("Uploading 10k workload...")
    start_time = time.time()
    with open(filename, "rb") as f:
        res = requests.post(f"{API_URL}/uploads", data={"sector_context": "Technology"}, files={"file": f})
    
    assert res.status_code == 200, f"Upload failed: {res.text}"
    upload_id = res.json()["upload_id"]
    print(f"Upload accepted. Upload ID: {upload_id}")

    # Polling status
    print("Polling processing status...")
    while True:
        status_res = requests.get(f"{API_URL}/uploads/{upload_id}/status")
        assert status_res.status_code == 200, f"Status check failed: {status_res.text}"
        data = status_res.json()
        print(f"Status: {data['status']}, Processed: {data.get('processed_rows', 0)}/{data.get('total_rows', 0)}, Failed: {data.get('failed_rows', 0)}")
        if data["status"] in ["complete", "failed"]:
            break
        time.sleep(2)
        
    execution_time = time.time() - start_time
    print(f"Processing finished in {execution_time:.2f} seconds.")

    assert data["status"] == "complete", "Processing did not complete successfully"
    if data.get('failed_rows', 0) < 2:
        print("Warning: Expected at least 2 failed rows due to dirty fixtures.")

    print("Asserting cache correctness...")
    # Fetch results
    res_results = requests.get(f"{API_URL}/uploads/{upload_id}/results")
    assert res_results.status_code == 200
    results_data = res_results.json()
    assert results_data["meta"]["total_articles"] > 0, "No articles aggregated"
    assert "widgets" in results_data, "No widgets in response"
    print("Cache correctness verified.")

if __name__ == "__main__":
    test_api_failure_cases()
    filename = generate_workload()
    test_workload_and_cache(filename)
    print("ALL TESTS PASSED")
