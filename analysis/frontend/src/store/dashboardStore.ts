import { create } from "zustand";

type DashboardState = {
  scope: "sector" | "client";
  scopeValue: string;
  setScope: (scope: "sector" | "client") => void;
  setScopeValue: (value: string) => void;
};

export const useDashboardStore = create<DashboardState>((set) => ({
  scope: "sector",
  scopeValue: "General",
  setScope: (scope) => set({ scope }),
  setScopeValue: (scopeValue) => set({ scopeValue }),
}));
