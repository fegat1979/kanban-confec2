// src/components/StageX.tsx - VERSÃO FINAL (SCROLL ESTÁVEL)
import React, { useState, useMemo, useRef, useLayoutEffect } from "react";
import { COLUMN_TITLES } from "../data";
import type { Card, ColumnKey, StageKey } from "../types";
import { Column } from "./Column";
import { stageTotals } from "../utils";
import { ChevronDown, ChevronUp, PanelRightClose, PanelRightOpen } from "lucide-react";
import { useUIStore } from "../store/uiContext";

type StageProps = {
  stage: { key: StageKey; title: string; columns: ColumnKey[] };
  cards: Card[];   // recebe apenas os cartões desta etapa
  setCards: React.Dispatch<React.SetStateAction<Card[]>>;
  onEdit: (c: Card) => void;
  onDelete: (id: string) => void;
};

export function Stage({ stage, cards, setCards, onEdit, onDelete }: StageProps) {
  const [collapsed, setCollapsed] = useState(false);

  const totals = useMemo(() => stageTotals(cards, stage.columns), [cards, stage.columns]);

  const columnsUI = useUIStore((s) => s.columnsUI);
  const toggleByIds = useUIStore((s) => s.toggleRailsByIds);
  const allRail = stage.columns.every((col) => columnsUI[col]?.isRail === true);

  const handleToggleStageRails = () => toggleByIds(stage.columns, !allRail);

  // SCROLL ESTÁVEL - NUNCA RESETA
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollLeftRef = useRef(0);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const save = () => { scrollLeftRef.current = el.scrollLeft; };
    el.addEventListener("scroll", save, { passive: true });
    return () => el.removeEventListener("scroll", save);
  }, []);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const saved = scrollLeftRef.current;
    if (saved > 0) {
      requestAnimationFrame(() => { el.scrollLeft = saved; });
      setTimeout(() => { el.scrollLeft = saved; }, 0);
      setTimeout(() => { el.scrollLeft = saved; }, 20);
    }
  }, [cards]);

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
        <button onClick={() => setCollapsed(v => !v)} className="p-1 rounded hover:bg-slate-100" title={collapsed ? "Expandir" : "Recolher"}>
          {collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
        <button onClick={handleToggleStageRails} className="p-1 rounded hover:bg-slate-100" title={allRail ? "Expandir colunas" : "Recolher colunas"}>
          {allRail ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
        </button>
        <h2 className="text-lg font-semibold flex-1">{stage.title}</h2>
        <div className="flex gap-3 text-sm">
          <span className="px-3 py-1 bg-slate-100 rounded font-medium">PED: <b>{totals.pedidos}</b></span>
          <span className="px-3 py-1 bg-slate-100 rounded font-medium">PÇS: <b>{totals.pecas}</b></span>
        </div>
      </header>

      {collapsed ? (
        <div className="px-6 py-8 text-slate-500 italic text-center">Etapa recolhida – clique na seta para expandir</div>
      ) : stage.key === "CALENDARIO" ? (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stage.columns.map(col => (
            <Column key={col} columnKey={col} title={COLUMN_TITLES[col]} cards={cards} setCards={setCards} onEdit={onEdit} onDelete={onDelete} calendarStyle />
          ))}
        </div>
      ) : (
        <div className="p-4 overflow-x-auto">
          <div ref={scrollRef} className="flex gap-4 min-w-full overflow-x-auto">
            {stage.columns.map(col => (
              <Column key={col} columnKey={col} title={COLUMN_TITLES[col]} cards={cards} setCards={setCards} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}