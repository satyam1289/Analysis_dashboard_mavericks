export type WidgetPending = { status: "pending" | "computing"; retry_after?: number };
export type WidgetData = { data?: any[]; message?: string; computed_at?: string };
