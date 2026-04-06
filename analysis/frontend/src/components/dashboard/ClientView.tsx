import { DashboardWidgets } from "./widgets_all";

export function ClientView({ data }: { data: any }) {
  return <DashboardWidgets data={data} />;
}
