// src/components/Column.tsx
import React, { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import type { Card as CardType, ColumnKey } from "../types";
import { columnTotals } from "../utils";
import { Minimize2, Maximize2, PanelRightOpen } from "lucide-react";
import { KanbanCard } from "./KanbanCard";
import { WipBadge } from "./WipBadge";

import { useUIStore } from "../store/uiContext";
import ColumnHeaderRail from "./ColumnHeaderRail";

export function Column({
  columnKey,
  title,
  cards,
  setCards,
  onEdit,
  onDelete,
  calendarStyle,
  colWidthPx,
}: {
  columnKey: ColumnKey;
  title: string;
  cards: CardType[];
  setCards: React.Dispatch<React.SetStateAction<CardType[]>>;
  onEdit: (c: CardType) => void;
  onDelete: (id: string) => void;
  calendarStyle?: boolean;
  colWidthPx?: number;
}) {
  const isRail = useUIStore(s => s.columnsUI[columnKey]?.isRail ?? false);
  const setRail = useUIStore(s => s.setColumnRail);
  const { setNodeRef } = useDroppable({ id: `column:${columnKey}`, disabled: isRail });

  const list = useMemo(
    () =>
      cards
        .filter((c) => c.column === columnKey)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [cards, columnKey]
  );

  const totals = useMemo(() => columnTotals(cards, columnKey), [cards, columnKey]);
  const width = colWidthPx ?? 384;
  const allCompact = list.length > 0 && list.every((c: any) => c.compact === true);

  function handleToggleCardCompact(id: string, val: boolean | undefined) {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const nc: any = { ...c };
        if (typeof val === "boolean") nc.compact = val; else delete nc.compact;
        return nc as CardType;
      })
    );
  }

  function toggleAll() {
    setCards((prev) => {
      const currentList = prev.filter((c) => c.column === columnKey);
      const everyCompact = currentList.length > 0 && currentList.every((c: any) => c.compact === true);
      const nextCompact = !everyCompact;
      return prev.map((c) =>
        c.column === columnKey ? ({ ...(c as any), compact: nextCompact } as CardType) : c
      );
    });
  }

  // === MODO TRILHO ===
  if (isRail) {
    return (
      <div className="column column--rail" style={calendarStyle ? undefined : { width: "auto", minWidth: "auto" }}>
        <ColumnHeaderRail
          columnId={columnKey}
          title={title}
          cards={list}
          wipLimit={undefined}
          piecesTotal={totals.pecas}
        />
      </div>
    );
  }

  // === MODO EXPANDIDO ===
  return (
    <div
      className={
        "bg-slate-50 rounded-xl border border-slate-200 flex flex-col col-responsive " +
        (calendarStyle ? "w-full" : "")
      }
      style={calendarStyle ? undefined : { width, minWidth: width }}
    >
      <header className="flex items-center gap-3 px-3 py-2 border-b border-slate-200">
        {/* 👇 AGORA este é o botão de RECOLHER VERTICAL (no mesmo lugar do antigo) */}
        <button
          onClick={() => setRail(columnKey, true)}
          className="shrink-0 p-1 rounded hover:bg-slate-100"
          title="Recolher como trilho vertical"
        >
          <PanelRightOpen size={18} />
        </button>

        <h3 className="font-semibold text-sm">{title}</h3>

        <div className="ml-auto text-xs flex items-center gap-2">
          <span className="text-slate-600">QTD PED: <b>{totals.pedidos}</b></span>
          <span className="text-slate-600">QTD PÇS: <b>{totals.pecas}</b></span>
          <WipBadge column={columnKey} count={totals.pedidos} />
        </div>

        {/* Alternância compactar/expandir cartões da coluna */}
        <button
          onClick={toggleAll}
          disabled={list.length === 0}
          className="ml-1 p-1.5 rounded hover:bg-slate-100 disabled:opacity-40"
          title={
            list.length === 0
              ? "Sem cartões"
              : allCompact
              ? "Expandir todos os cartões"
              : "Compactar todos os cartões"
          }
        >
          {allCompact ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
        </button>
      </header>

      <div ref={setNodeRef} className="p-3 space-y-3 min-h-[60px]">
        <SortableContext items={list.map((c) => c.id)} strategy={rectSortingStrategy}>
          {list.map((c) => (
            <KanbanCard
              key={c.id}
              card={c}
              onEdit={() => onEdit(c)}
              onDelete={() => onDelete(c.id)}
              onToggleCompact={handleToggleCardCompact}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
