import React from "react";
import clsx from "clsx";
import type { Card as CardType } from "../types";
import { deadlineColor, fmtDate, remainingPieces } from "../utils";

const tipoLabel = (t?: any) => {
  const v = String(t || "CASUAL");
  if (v === "PRONTA_ENTREGA") return "PRONTA ENTREGA";
  return v;
};

const tipoBadgeClass = (t?: any) => {
  const v = String(t || "CASUAL");
  return clsx(
    "text-xs px-2 py-0.5 rounded-full",
    v === "CASUAL" && "bg-slate-200 text-slate-800",
    v === "ESCOLAR" && "bg-blue-100 text-blue-800",
    v === "PRONTA_ENTREGA" && "bg-emerald-100 text-emerald-800",
    v === "ATENDIMENTO" && "bg-orange-100 text-orange-800",
    v === "ESPORTIVO" && "bg-red-100 text-red-800"
  );
};

export function KanbanCardPreview({ card }: { card: CardType }) {
  const isDone = card.column === "CONCLUIDO";
  const barColor = deadlineColor(card, isDone);
  const qtdConcluida = Number((card as any).qtdConcluida || 0);
  const restante = remainingPieces(card as any);

  return (
    <article className="relative bg-white border rounded-xl shadow-sm overflow-hidden opacity-90">
      <div className={clsx("absolute left-0 top-0 h-full w-1", barColor)} />
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Núm.: {card.numero}</div>
          <div className="flex items-center gap-2">
            <span className={tipoBadgeClass((card as any).tipo)}>{tipoLabel((card as any).tipo)}</span>
            <span
            className={clsx(
              "text-xs px-2 py-0.5 rounded-full",
              card.prioridade === "Alta" && "bg-red-100 text-red-700",
              card.prioridade === "Média" && "bg-amber-100 text-amber-700",
              card.prioridade === "Baixa" && "bg-emerald-100 text-emerald-700"
            )}
          >
            {card.prioridade}
          </span>
          </div>
        </div>
        <div className="text-slate-700 text-sm">{card.descricao}</div>
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
