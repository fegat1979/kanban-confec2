// FILE: src/components/WipBadge.tsx
import React, { useMemo } from "react";
import type { ColumnKey } from "../types";
import { loadWip } from "../storage";

export function WipBadge({ column, count }:{ column: ColumnKey, count: number }){
  const wip = useMemo(()=> loadWip(), []);
  const limit = wip?.[column] ?? null;
  const pct = limit ? (count/limit) : 0;
  const color = limit ? (pct >= 1 ? "bg-red-500" : pct >= 0.8 ? "bg-yellow-500" : "bg-slate-300") : "bg-slate-300";
  return (
    <div className="flex items-center gap-1 text-[11px]">
      <span className={`inline-block w-2 h-2 rounded-full ${color}`}></span>
      <span className="text-slate-600">WIP: <b>{count}</b>/{limit ?? "∞"}</span>
    </div>
  )
}