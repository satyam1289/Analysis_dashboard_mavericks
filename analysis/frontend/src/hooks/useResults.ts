import { useEffect, useState } from "react";
import { getResults } from "../api/results";

export function useResults(uploadId: string, scope: "sector" | "client" | "compare", scopeValue: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const fetchScope = scope === "compare" ? "client" : scope;
    getResults(uploadId, fetchScope, scopeValue)
      .then((r) => {
        if (active) setData(r);
      })
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [uploadId, scope, scopeValue]);

  return { data, loading, error };
}
