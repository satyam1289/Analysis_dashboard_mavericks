from pydantic import BaseModel


class WidgetPayload(BaseModel):
    data: list | None = None
    status: str | None = None
    computed_at: str | None = None
    message: str | None = None


class ResultsResponse(BaseModel):
    upload_id: str
    scope: str
    scope_value: str
    reachlens_enabled: bool
    widgets: dict
    meta: dict
