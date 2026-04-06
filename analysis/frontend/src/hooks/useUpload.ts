import { useCallback, useState } from "react";
import { getUploadStatus, uploadFile } from "../api/uploads";
import { usePolling } from "./usePolling";

export function useUpload() {
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");

  const startUpload = useCallback(async (file: File) => {
    const data = await uploadFile(file);
    setUploadId(data.upload_id);
    setStatus(data.status);
    return data.upload_id as string;
  }, []);

  const poll = useCallback(async () => {
    if (!uploadId) return;
    const s = await getUploadStatus(uploadId);
    setStatus(s.status);
  }, [uploadId]);

  usePolling(poll, !!uploadId && status !== "complete" && status !== "failed", 3000);

  return { uploadId, status, startUpload };
}
