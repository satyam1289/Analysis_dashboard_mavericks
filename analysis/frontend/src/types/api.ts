export type UploadStatus = {
  upload_id: string;
  status: string;
  processed_rows: number;
  total_rows: number | null;
  failed_rows: number;
  error_summary: Array<Record<string, unknown>>;
};

export type ResultsResponse = {
  upload_id: string;
  scope: "sector" | "client";
  scope_value: string;
  reachlens_enabled: boolean;
  widgets: Record<string, any>;
  meta: Record<string, any>;
};
