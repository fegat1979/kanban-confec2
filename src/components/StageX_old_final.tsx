// src/components/Stage.tsx
import React, { useState, useMemo } from "react";
import { COLUMN_TITLES } from "../data";
import type { Card, ColumnKey, StageKey } from "../types";
import { Column } from "./Column";
import { stageTotals } from "../utils";
import { ChevronDown, ChevronUp, PanelRightClose, PanelRightOpen } from "lucide-react";
import { useUIStore } from "../store/uiContext";

type StageProps = {
  stage: { key: StageKey; title: string; columns: ColumnKey[] };
  cards: Card[];
  setCards: React.Dispatch<React.SetStateAction<Card[]>>;
  onEdit: (c: Card) => void;
  onDelete: (id: string) => void;
};

export function Stage({ stage, cards, setCards, onEdit, onDelete }: StageProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Totais da etapa (QTD PED e QTD PÇS)
  const totals = useMemo(() => stageTotals(cards, stage.columns), [cards, stage.columns]);

  // Zustand para controle de trilho (rail) das colunas
  const columnsUI = useUIStore((s) => s.columnsUI);
  const toggleByIds = useUIStore((s) => s.toggleRailsByIds);

  // Verifica se TODAS as colunas desta etapa estão no modo trilho
  const allRail = stage.columns.every((col) => columnsUI[col]?.isRail === true);

  const handleToggleStageRails = () => {
    toggleByIds(stage.columns, !allRail); // alterna entre recolher e expandir
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200">
      {/* Cabeçalho da etapa */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
        {/* Recolher/expandir a etapa inteira */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="p-1 rounded hover:bg-slate-100"
          title={collapsed ? "Expandir etapa" : "Recolher etapa"}
        >
          {collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>

        {/* Botão de trilho (recolher todas colunas de uma vez) */}
        <button
          onClick={handleToggleStageRails}
          className="p-1 rounded hover:bg-slate-100"
          title={allRail ? "Expandir colunas" : "Recolher colunas (trilho)"}
        >
          {allRail ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
        </button>

        <h2 className="text-lg font-semibold flex-1">{stage.title}</h2>

        {/* Totais */}
        <div className="flex gap-3 text-sm">
          <span className="px-3 py-1 bg-slate-100 rounded font-medium">
            PED: <b>{totals.pedidos}</b>
          </span>
          <span className="px-3 py-1 bg-slate-100 rounded font-medium">
            PÇS: <b>{totals.pecas}</b>
          </span>
        </div>
      </header>

      {/* Conteúdo da etapa */}
      {collapsed ? (
        <div className="px-6 py-8 text-slate-500 italic text-center">
          Etapa recolhida – clique na seta para expandir
        </div>
      ) : (
        <div className={stage.key === "CALENDARIO" ? "p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "p-4 overflow-x-auto"}>
          {stage.key === "CALENDARIO" ? (
            // Calendário: grid bonito com meses
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
            // Outras etapas: scroll horizontal
            <div className="flex gap-4 min-w-full">
              {stage.columns.map((col) => (
                <Column
                  key={col}
                  columnKey={col}
                  title={COLUMN_TITLES[col]}
                  cards={cards}
                  setCards={setCards}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}