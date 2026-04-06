import { api } from "./client";

export async function uploadFile(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await api.post("/uploads", fd);
  return res.data;
}

export async function getUploadStatus(uploadId: string) {
  const res = await api.get(`/uploads/${uploadId}/status`);
  return res.data;
}
