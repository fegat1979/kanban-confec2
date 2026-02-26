import React, { useMemo, useState } from "react";
import { STAGES } from "../data";
import type { Card, Card as CardType, ColumnKey, TipoPedido } from "../types";
import { Stage } from "./StageX";
import { DndContext, type DragEndEvent, DragOverlay, closestCorners } from "@dnd-kit/core";
import { createPortal } from "react-dom";
import { KanbanCard } from "./KanbanCard";
import { KanbanCardPreview } from "./KanbanCardPreview";
import { saveCards } from "../storage";
import { setCard } from "../services/cards";
// filtro de tipo fica no header (App). Aqui o Board só recebe os tipos selecionados.

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
    return cards.filter((c: any) => set.has((c.tipo || "CASUAL") as TipoPedido));
  }, [cards, selectedTipos]);

  const activeCard = useMemo(() => visibleCards.find((c) => c.id === activeId) || null, [activeId, visibleCards]);

  function stageFromColumn(col: ColumnKey) {
    if (["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"].includes(col as any)) return "CALENDARIO" as const;
    if (["AG_MP","AG_CORTE","GERAR_PED"].includes(col as any)) return "PRE" as const;
    if (["PCP","DISTRIBUICAO","COSTURA","PINTURA","ESTAMPA_FILME","ARREMATE","EMBALAGEM","EXPEDICAO"].includes(col as any)) return "PROD" as const;
    return "DONE" as const;
  }

  // 👇 util para obter as colunas de uma etapa (tenta usar STAGES, senão infere pelos cards)
  function getColumnsForStage(stageKey: string): ColumnKey[] {
    const s: any = STAGES.find((x: any) => x.key === stageKey);
    // tenta achar em propriedades comuns:
    const explicit: ColumnKey[] | undefined =
      s?.columns || s?.columnIds || s?.cols || s?.colunas;

    if (explicit && Array.isArray(explicit) && explicit.length) {
      return explicit as ColumnKey[];
    }

    // fallback: infere dos cards presentes no board
    const set = new Set<ColumnKey>();
    for (const c of cards) {
      const st = stageFromColumn(c.column);
      if (st === stageKey) set.add(c.column);
    }
    return Array.from(set);
  }

  async function persist(updated: Card, snapshot: Card[]) {
    if (USE_FB) {
      try {
        await setCard(BOARD_ID, updated); // upsert com { order, column, stage }
      } catch (e: any) {
        alert(`Falha ao salvar no Firebase: ${e?.code || e?.message || e}`);
        console.error(e);
      }
    } else {
      saveCards(snapshot);
    }
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);

    const overRaw = e.over?.id as string | undefined;
    const cardId = String(e.active.id);
    if (!overRaw) return;

    setCards((prev) => {
      const moving = prev.find((c) => c.id === cardId);
      if (!moving) return prev;

      let next = prev.filter((c) => c.id !== cardId);

      // helpers
      const byOrder = (a: Card, b: Card) => (a.order ?? 0) - (b.order ?? 0);

      // Solto na COLUNA (topo)
      if (overRaw.startsWith("column:")) {
        const column = overRaw.slice("column:".length) as ColumnKey;
        const colItems = next.filter((c) => c.column === column).sort(byOrder);
        const top = colItems[0];
        const newOrder = top ? (top.order ?? 0) - 1 : 0;

        const updated: Card = {
          ...moving,
          column,
          stage: stageFromColumn(column),
          order: newOrder,
          updatedAt: new Date().toISOString(),
        };

        next = [...next, updated];
        persist(updated, next);
        return next;
      }

      // Solto SOBRE OUTRO CARD (antes dele)
      const targetId = overRaw.startsWith("card:") ? overRaw.slice(5) : overRaw;
      const target = prev.find((c) => c.id === targetId);
      if (!target) return prev;

      const column = target.column;
      // lista da coluna sem o item em movimento
      const colItems = next.filter((c) => c.column === column).sort(byOrder);
      const tIdx = colItems.findIndex((c) => c.id === target.id);
      const prevNeighbor = colItems[tIdx - 1];

      const targetOrder = target.order ?? 0;
      const newOrder = prevNeighbor
        ? ((prevNeighbor.order ?? 0) + targetOrder) / 2
        : targetOrder - 1;

      const updated: Card = {
        ...moving,
        column,
        stage: stageFromColumn(column),
        order: newOrder,
        updatedAt: new Date().toISOString(),
      };

      next = [...next, updated];
      persist(updated, next);
      return next;
    });
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
      {STAGES.map((s: any) => {
        //const columnIds = getColumnsForStage(s.key); // 👈 pega as colunas da etapa
        return (
          <div key={s.key} className="space-y-2">
            {/* ❌ Remover qualquer barra/cabeçalho extra aqui */}
            {/* ✅ Agora o Stage recebe columnIds e o botão vai aparecer no header dele */}
            <Stage
              stage={s}
              cards={visibleCards}
              setCards={setCards}
              onEdit={onEdit}
              onDelete={onDelete}
              //columnIds={columnIds}  // 👈 novo
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
