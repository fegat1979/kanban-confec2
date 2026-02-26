import { create } from "zustand";
import type { ColumnKey } from "../types";

type ColumnUI = { isRail: boolean };
type UIState = {
  columnsUI: Record<ColumnKey, ColumnUI>;
  toggleColumnRail: (id: ColumnKey) => void;
  setColumnRail: (id: ColumnKey, isRail: boolean) => void;
  toggleAllRails: (value?: boolean) => void;
};

const LS_KEY = "kanban-ui-v1";
const load = (): UIState["columnsUI"] => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; }
};
const persist = (data: UIState["columnsUI"]) => { try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {} };

export const useUIStore = create<UIState>((set, get) => ({
  columnsUI: load(),
  toggleColumnRail: (id) => {
    const prev = get().columnsUI[id]?.isRail ?? false;
    const next = { ...get().columnsUI, [id]: { isRail: !prev } };
    persist(next); set({ columnsUI: next });
  },
  setColumnRail: (id, isRail) => {
    const next = { ...get().columnsUI, [id]: { isRail } };
    persist(next); set({ columnsUI: next });
  },
  toggleAllRails: (value) => {
    const cur = get().columnsUI;
    const target = value ?? !Object.values(cur).every(c => c?.isRail);
    const next = Object.fromEntries(Object.keys(cur).map(k => [k, { isRail: target }]));
    persist(next); set({ columnsUI: next });
  },
}));
