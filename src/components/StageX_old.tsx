import React, { useMemo, useState } from "react";
import { COLUMN_TITLES } from "../data";
import type { Card as CardType, ColumnKey, StageKey, StageWidths } from "../types";
import { Column } from "./Column";
import { stageTotals } from "../utils";
import { ChevronDown, ChevronUp, PanelRightClose, PanelRightOpen } from "lucide-react";
import { loadStageWidths } from "../storage";

// 👇 estado de UI para rail/expand das colunas
import { useUIStore } from "../store/uiContext"; // caminho relativo

export function Stage({
  stage,
  cards,
  setCards,
  onEdit,
  onDelete,
}: {
  stage: { key: StageKey; title: string; columns: ColumnKey[] };
  cards: CardType[];
  setCards: React.Dispatch<React.SetStateAction<CardType[]>>;
  onEdit: (c: CardType) => void;
  onDelete: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const totals = useMemo(() => stageTotals(cards, stage.columns), [cards, stage.columns]);

  const widths: StageWidths = loadStageWidths() || {};

  const DEFAULT_STAGE_WIDTHS: Record<StageKey, number> = {
    CALENDARIO: 320,
    PRE: 352,
    PROD: 384,
    DONE: 360,
  };

  const colWidthPx =
    stage.key === "CALENDARIO"
      ? undefined
      : (widths[stage.key] ?? DEFAULT_STAGE_WIDTHS[stage.key]);

  // ====== NOVO: “botão único” de recolher/expandir TODAS as colunas da etapa ======
  const columnsUI = useUIStore((s) => s.columnsUI);
  const toggleByIds = useUIStore((s) => s.toggleRailsByIds);

  // estado agregado: todas as colunas desta etapa estão em trilho?
  const slice = (stage.columns || []).map((id) => columnsUI[id]?.isRail ?? false);
  const allRail = slice.length > 0 && slice.every((v) => v === true);

  function handleToggleStageRails() {
    // se todas estão recolhidas (rail), expandimos todas; senão, recolhemos todas
    toggleByIds(stage.columns, allRail ? false : true);
  }
  // ================================================================================

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
        {/* Botão existente: recolher/expandir a ETAPA (conteúdo visual da etapa) */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="shrink-0 p-1 rounded hover:bg-slate-100"
          title={collapsed ? "Expandir etapa" : "Recolher etapa"}
        >
          {collapsed ? <ChevronDown /> : <ChevronUp />}
        </button>

        {/* NOVO: Botão único para recolher/expandir TODAS as colunas desta etapa (modo trilho) */}
        <button
          onClick={handleToggleStageRails}
          className="shrink-0 p-1 rounded hover:bg-slate-100 rail__toggle"
          title={allRail ? "Expandir colunas da etapa" : "Recolher colunas da etapa (trilho)"}
        >
          {allRail ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
        </button>

        {/* Título da etapa vem depois dos botões */}
        <h2 className="text-base md:text-lg font-semibold">{stage.title}</h2>

        <div className="ml-auto text-sm text-slate-700 flex gap-3">
          <span className="px-2 py-0.5 bg-slate-100 rounded">
            QTD PED: <b>{totals.pedidos}</b>
          </span>
          <span className="px-2 py-0.5 bg-slate-100 rounded">
            QTD PÇS: <b>{totals.pecas}</b>
          </span>
        </div>
      </header>

      {collapsed ? (
        <div className="px-4 py-6 text-slate-500 italic">Etapa recolhida</div>
      ) : (
        <div
          className={
            stage.key === "CALENDARIO"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4"
              : "overflow-x-auto p-4"
          }
        >
          {stage.key === "CALENDARIO" ? (
            stage.columns.map((col) => (
              <Column
                key={col}
                columnKey={col}
                title={COLUMN_TITLES[col]}
                cards={cards}
                setCards={setCards}
                onEdit={onEdit}
                onDelete={onDelete}
                calendarStyle
              />
            ))
          ) : (
            <div className="flex gap-4 min-w-full overflow-x-auto">
              {stage.columns.map((col) => (
                <Column
                  key={col}
                  columnKey={col}
                  title={COLUMN_TITLES[col]}
                  cards={cards}
                  setCards={setCards}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  colWidthPx={colWidthPx}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
