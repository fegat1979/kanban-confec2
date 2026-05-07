// src/components/Board.tsx - VERSÃO FINAL CORRIGIDA (SCROLL + TYPE SCRIPT OK)
import React, { useMemo, useState, useCallback } from "react";
import { STAGES } from "../data";
import type { Card, Card as CardType, ColumnKey, TipoPedido, StageKey } from "../types";
import { Stage } from "./StageX";
import { DndContext, type DragEndEvent, DragOverlay, closestCorners } from "@dnd-kit/core";
import { createPortal } from "react-dom";
import { KanbanCardPreview } from "./KanbanCardPreview";
import { saveCards } from "../storage";
import { setCard } from "../services/cards";

const USE_FB = String(import.meta.env.VITE_USE_FIREBASE) === "1";
const BOARD_ID = import.meta.env.VITE_BOARD_ID || "default";

export function Board({
  cards,
  setCards,
  onEdit,
  onDelete,
  selectedTipos,
}: {
  cards: CardType[];
  setCards: React.Dispatch<React.SetStateAction<CardType[]>>;
  onEdit: (c: CardType) => void;
  onDelete: (id: string) => void;
  selectedTipos: TipoPedido[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const visibleCards = useMemo(() => {
    if (!selectedTipos.length) return cards;
    const set = new Set(selectedTipos);
    return cards.filter((c) => set.has((c.tipo || "CASUAL") as TipoPedido));
  }, [cards, selectedTipos]);

  const activeCard = useMemo(() => visibleCards.find((c) => c.id === activeId) || null, [activeId, visibleCards]);

  // FILTRA CARTÕES POR ETAPA (corrige scroll + performance)
  const cardsByStage = useMemo(() => {
    const map: Record<StageKey, CardType[]> = {} as any;
    STAGES.forEach((s) => {
      map[s.key as StageKey] = visibleCards.filter((c) => {
        if (s.key === "CALENDARIO") return ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"].includes(c.column);
        if (s.key === "PRE") return ["AG_MP","AG_CORTE","GERAR_PED"].includes(c.column);
        if (s.key === "PROD") return ["PCP","DISTRIBUICAO","COSTURA","PINTURA","ESTAMPA_FILME","ARREMATE","EMBALAGEM","EXPEDICAO"].includes(c.column);
        if (s.key === "DONE") return c.column === "CONCLUIDO";
        return false;
      });
    });
    return map;
  }, [visibleCards]);

  function stageFromColumn(col: ColumnKey) {
    if (["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"].includes(col as any)) return "CALENDARIO" as const;
    if (["AG_MP","AG_CORTE","GERAR_PED"].includes(col as any)) return "PRE" as const;
    if (["PCP","DISTRIBUICAO","COSTURA","PINTURA","ESTAMPA_FILME","ARREMATE","EMBALAGEM","EXPEDICAO"].includes(col as any)) return "PROD" as const;
    return "DONE" as const;
  }

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    setActiveId(null);
    const overRaw = e.over?.id as string | undefined;
    const cardId = String(e.active.id);
    if (!overRaw) return;

    setCards((prev) => {
      const moving = prev.find((c) => c.id === cardId);
      if (!moving) return prev;

      let next = prev.filter((c) => c.id !== cardId);
      const byOrder = (a: Card, b: Card) => (a.order ?? 0) - (b.order ?? 0);

      if (overRaw.startsWith("column:")) {
        const column = overRaw.slice("column:".length) as ColumnKey;
        const colItems = next.filter((c) => c.column === column).sort(byOrder);
        const newOrder = colItems[0] ? (colItems[0].order ?? 0) - 1 : 0;
        const updated: Card = { ...moving, column, stage: stageFromColumn(column), order: newOrder, updatedAt: new Date().toISOString() };
        next = [...next, updated];
        persist(updated, next);
        return next;
      }

      const targetId = overRaw.startsWith("card:") ? overRaw.slice(5) : overRaw;
      const target = prev.find((c) => c.id === targetId);
      if (!target) return prev;

      const column = target.column;
      const colItems = next.filter((c) => c.column === column).sort(byOrder);
      const tIdx = colItems.findIndex((c) => c.id === target.id);
      const prevNeighbor = colItems[tIdx - 1];
      const targetOrder = target.order ?? 0;
      const newOrder = prevNeighbor ? ((prevNeighbor.order ?? 0) + targetOrder) / 2 : targetOrder - 1;

      const updated: Card = { ...moving, column, stage: stageFromColumn(column), order: newOrder, updatedAt: new Date().toISOString() };
      next = [...next, updated];
      persist(updated, next);
      return next;
    });
  }, [setCards]);

  async function persist(updated: Card, snapshot: Card[]) {
    if (USE_FB) {
      try { await setCard(BOARD_ID, updated); }
      catch (e: any) { alert(`Falha ao salvar: ${e?.message || e}`); }
    } else {
      saveCards(snapshot);
    }
  }

  return (
    <DndContext
      autoScroll={false}
      onDragStart={(e) => setActiveId(String(e.active.id))}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
      collisionDetection={closestCorners}
    >
      <div className="max-w-[1400px] mx-auto p-4 space-y-6">
        {STAGES.map((s) => {
          const stageKey = s.key as StageKey;   // ← CORREÇÃO DO ERRO
          return (
            <div key={s.key} className="space-y-2">
              <Stage
                stage={s}
                cards={cardsByStage[stageKey] || []}
                setCards={setCards}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          );
        })}
      </div>

      {createPortal(
        <DragOverlay dropAnimation={null}>
          {activeCard ? <KanbanCardPreview card={activeCard} /> : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}