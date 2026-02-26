// src/store/uiContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { ColumnKey } from "../types"; // ajuste o caminho conforme seu projeto

type ColumnUI = { isRail: boolean };

// ✅ use Partial para não exigir todas as colunas de início
type State = { columnsUI: Partial<Record<ColumnKey, ColumnUI>> };

type Action =
  | { type: "TOGGLE_RAIL"; id: ColumnKey }
  | { type: "SET_RAIL"; id: ColumnKey; isRail: boolean }
  | { type: "TOGGLE_ALL"; value?: boolean }
  | { type: "SET_MANY"; ids: ColumnKey[]; value: boolean }
  | { type: "TOGGLE_BY_IDS"; ids: ColumnKey[]; value?: boolean };

const LS_KEY = "kanban-ui-v1";

const load = (): State => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return { columnsUI: parsed as State["columnsUI"] };
  } catch {
    return { columnsUI: {} };
  }
};

const persist = (s: State) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s.columnsUI)); } catch {}
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "TOGGLE_RAIL": {
      const prev = state.columnsUI[action.id]?.isRail ?? false;
      return { columnsUI: { ...state.columnsUI, [action.id]: { isRail: !prev } } };
    }
    case "SET_RAIL": {
      return { columnsUI: { ...state.columnsUI, [action.id]: { isRail: action.isRail } } };
    }
    case "TOGGLE_ALL": {
      const cur = state.columnsUI;
      const allAreRail = Object.values(cur).length > 0 && Object.values(cur).every(c => c?.isRail);
      const target = action.value ?? !allAreRail;
      // mantém só as chaves existentes; se quiser preencher todas, faça em outro passo
      const next: State["columnsUI"] = {};
      for (const k of Object.keys(cur) as ColumnKey[]) next[k] = { isRail: target };
      return { columnsUI: next };
    }
      case "SET_MANY": {
      const next = { ...state.columnsUI };
      for (const id of action.ids) next[id] = { isRail: action.value };
      return { columnsUI: next };
    }
    case "TOGGLE_BY_IDS": {
      const cur = state.columnsUI;
      const slice = action.ids.map(id => cur[id]?.isRail ?? false);
      const allRail = slice.length > 0 && slice.every(v => v);
      const target = action.value ?? !allRail;
      const next = { ...cur };
      for (const id of action.ids) next[id] = { isRail: target };
      return { columnsUI: next };
    }
    default:
      return state;
  }
}

const StateCtx = createContext<State | null>(null);
const DispatchCtx = createContext<React.Dispatch<Action> | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => { persist(state); }, [state]);

  const valueState = useMemo(() => state, [state]);
  const valueDispatch = useMemo(() => dispatch, [dispatch]);

  return (
    <StateCtx.Provider value={valueState}>
      <DispatchCtx.Provider value={valueDispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export function useUIStore<T = any>(selector?: (api: {
  columnsUI: State["columnsUI"];
  toggleColumnRail: (id: ColumnKey) => void;
  setColumnRail: (id: ColumnKey, isRail: boolean) => void;
  toggleAllRails: (value?: boolean) => void;
  setManyRails: (ids: ColumnKey[], value: boolean) => void;
  toggleRailsByIds: (ids: ColumnKey[], value?: boolean) => void;  
}) => T) {
  const state = useContext(StateCtx);
  const dispatch = useContext(DispatchCtx);
  if (!state || !dispatch) throw new Error("useUIStore precisa do <UIProvider> na raiz.");

  const api = {
    columnsUI: state.columnsUI,
    toggleColumnRail: (id: ColumnKey) => dispatch({ type: "TOGGLE_RAIL", id }),
    setColumnRail: (id: ColumnKey, isRail: boolean) => dispatch({ type: "SET_RAIL", id, isRail }),
    toggleAllRails: (value?: boolean) => dispatch({ type: "TOGGLE_ALL", value }),
    setManyRails: (ids: ColumnKey[], value: boolean) => dispatch({ type: "SET_MANY", ids, value }),
    toggleRailsByIds: (ids: ColumnKey[], value?: boolean) => dispatch({ type: "TOGGLE_BY_IDS", ids, value }),
  };
  return selector ? selector(api) : (api as unknown as T);
}
