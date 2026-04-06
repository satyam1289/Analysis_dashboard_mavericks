import { create } from "zustand";

type UploadState = {
  uploadId: string | null;
  status: string;
  setUpload: (uploadId: string, status: string) => void;
  setStatus: (status: string) => void;
};

export const useUploadStore = create<UploadState>((set) => ({
  uploadId: null,
  status: "idle",
  setUpload: (uploadId, status) => set({ uploadId, status }),
  setStatus: (status) => set({ status }),
}));
