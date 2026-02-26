// src/components/KanbanCardPreview.tsx
import React from "react";
import clsx from "clsx";
import type { Card } from "../types";
import { deadlineColor, fmtDate, remainingPieces } from "../utils";
import { getTipoLabel, getTipoBadgeClass, getPrioridadeBadgeClass } from "./KanbanCard";

export function KanbanCardPreview({ card }: { card: Card }) {
  const isDone = card.column === "CONCLUIDO";
  const barColor = deadlineColor(card, isDone);
  const qtdConcluida = Number(card.qtdConcluida || 0);
  const restante = remainingPieces(card);

  return (
    <article className="relative bg-white border rounded-xl shadow-sm overflow-hidden opacity-90 scale-[0.98]">
      <div className={clsx("absolute left-0 top-0 h-full w-1", barColor)} />
      
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Núm.: {card.numero}</div>
          <div className="flex items-center gap-2">
            <span className={getTipoBadgeClass(card.tipo)}>
              {getTipoLabel(card.tipo)}
            </span>
            <span className={getPrioridadeBadgeClass(card.prioridade)}>
              {card.prioridade || "Normal"}
            </span>
          </div>
        </div>

        <div className="text-slate-700 text-sm line-clamp-2">{card.descricao}</div>

        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
          <div><span className="font-semibold">Emi.:</span> {fmtDate(card.emissao)}</div>
          <div><span className="font-semibold">Ent.:</span> {fmtDate(card.entrega)}</div>
          <div><span className="font-semibold">Total:</span> {card.qtd}</div>
          <div><span className="font-semibold">Concl.:</span> {Math.min(qtdConcluida, card.qtd)}</div>
          <div><span className="font-semibold">Rest.:</span> {restante}</div>
        </div>
      </div>
    </article>
  );
}