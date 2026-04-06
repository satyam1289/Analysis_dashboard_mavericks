from pydantic import BaseModel


class UploadCreateResponse(BaseModel):
    upload_id: str
    status: str
    message: str


class UploadStatusResponse(BaseModel):
    upload_id: str
    status: str
    processed_rows: int
    total_rows: int | None
    failed_rows: int
    error_summary: list
