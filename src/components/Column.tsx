// src/components/Column.tsx
import React, { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import type { Card, ColumnKey } from "../types";
import { columnTotals } from "../utils";
import { Minimize2, Maximize2, PanelRightOpen } from "lucide-react";
import { KanbanCard } from "./KanbanCard";
import { WipBadge } from "./WipBadge";
import { useUIStore } from "../store/uiContext";
import ColumnHeaderRail from "./ColumnHeaderRail";

type ColumnProps = {
  columnKey: ColumnKey;
  title: string;
  cards: Card[];
  setCards: React.Dispatch<React.SetStateAction<Card[]>>;
  onEdit: (c: Card) => void;
  onDelete: (id: string) => void;
  calendarStyle?: boolean;
  colWidthPx?: number;
};

export function Column({
  columnKey,
  title,
  cards,
  setCards,
  onEdit,
  onDelete,
  calendarStyle,
  colWidthPx,
}: ColumnProps) {
  // Controle do modo trilho (recolhido)
  const isRail = useUIStore((s) => s.columnsUI[columnKey]?.isRail ?? false);
  const setRail = useUIStore((s) => s.setColumnRail);

  const { setNodeRef } = useDroppable({
    id: `column:${columnKey}`,
    disabled: isRail,
  });

  // Cartões desta coluna (filtrados e ordenados)
  const list = useMemo(() => {
    return cards
      .filter((c) => c.column === columnKey)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [cards, columnKey]);

  const totals = useMemo(() => columnTotals(cards, columnKey), [cards, columnKey]);

  // Verifica se TODOS os cartões estão compactos
  const allCompact = list.length > 0 && list.every((c) => c.compact === true);

  // Alterna compacto de um cartão individual
  const handleToggleCompact = (id: string, val: boolean | undefined) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, compact: typeof val === "boolean" ? val : undefined } as Card
          : c
      )
    );
  };

  // Compacta ou expande TODOS os cartões da coluna
  const toggleAllCompact = () => {
    const nextCompact = !allCompact;
    setCards((prev) =>
      prev.map((c) =>
        c.column === columnKey ? { ...c, compact: nextCompact } as Card : c
      )
    );
  };

  // === MODO TRILHO (coluna recolhida) ===
  if (isRail) {
    return (
      <div className="column column--rail">
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

  // === MODO NORMAL (expandido) ===
  const width = colWidthPx ?? 384;

  return (
    <div
      className={`bg-slate-50 rounded-xl border border-slate-200 flex flex-col ${
        calendarStyle ? "w-full" : ""
      }`}
      style={calendarStyle ? undefined : { width, minWidth: width }}
    >
      <header className="flex items-center gap-3 px-3 py-2 border-b border-slate-200">
        {/* Botão de recolher para trilho */}
        <button
          onClick={() => setRail(columnKey, true)}
          className="shrink-0 p-1 rounded hover:bg-slate-100"
          title="Recolher como trilho"
        >
          <PanelRightOpen size={18} />
        </button>

        <h3 className="font-semibold text-sm flex-1">{title}</h3>

        {/* Totais */}
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span>PED: <b>{totals.pedidos}</b></span>
          <span>PÇS: <b>{totals.pecas}</b></span>
          <WipBadge column={columnKey} count={totals.pedidos} />
        </div>

        {/* Botão compactar/expandir todos os cartões */}
        <button
          onClick={toggleAllCompact}
          disabled={list.length === 0}
          className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40"
          title={list.length === 0 ? "Sem cartões" : allCompact ? "Expandir todos" : "Compactar todos"}
        >
          {allCompact ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
        </button>
      </header>

      {/* Área onde os cartões ficam */}
      <div ref={setNodeRef} className="p-3 space-y-3 min-h-[60px]">
        <SortableContext items={list.map((c) => c.id)} strategy={rectSortingStrategy}>
          {list.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onEdit={() => onEdit(card)}
              onDelete={() => onDelete(card.id)}
              onToggleCompact={handleToggleCompact}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}