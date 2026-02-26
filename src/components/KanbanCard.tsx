// src/components/KanbanCard.tsx
import React, { useState, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card } from "../types";
import { deadlineColor, fmtDate, remainingPieces } from "../utils";
import { Move, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";

type KanbanCardProps = {
  card: Card;
  onEdit?: () => void;
  onDelete?: () => void;
  columnCompactOverride?: boolean;
  onToggleCompact?: (id: string, compact: boolean | undefined) => void;
  dragging?: boolean;
};

// Funções que vamos reutilizar depois no Preview
export const getTipoLabel = (tipo?: string): string => {
  const v = String(tipo || "CASUAL");
  return v === "PRONTA_ENTREGA" ? "PRONTA ENTREGA" : v;
};

export const getTipoBadgeClass = (tipo?: string) => {
  const v = String(tipo || "CASUAL");
  return clsx(
    "text-[11px] px-1.5 py-0.5 rounded-full font-medium",
    v === "CASUAL" && "bg-slate-200 text-slate-800",
    v === "ESCOLAR" && "bg-blue-100 text-blue-800",
    v === "PRONTA_ENTREGA" && "bg-emerald-100 text-emerald-800",
    v === "ATENDIMENTO" && "bg-orange-100 text-orange-800",
    v === "ESPORTIVO" && "bg-red-100 text-red-800"
  );
};

export const getPrioridadeBadgeClass = (prioridade?: string) => {
  return clsx(
    "text-xs px-2 py-0.5 rounded-full font-medium",
    prioridade === "Alta" && "bg-red-100 text-red-700",
    prioridade === "Média" && "bg-amber-100 text-amber-700",
    prioridade === "Baixa" && "bg-emerald-100 text-emerald-700",
    !prioridade && "bg-gray-100 text-gray-600"
  );
};

export function KanbanCard({
  card,
  onEdit,
  onDelete,
  columnCompactOverride = false,
  onToggleCompact,
  dragging = false,
}: KanbanCardProps) {
  const [compactLocal, setCompactLocal] = useState<boolean | undefined>(
    typeof card.compact === "boolean" ? card.compact : undefined
  );

  useEffect(() => {
    setCompactLocal(typeof card.compact === "boolean" ? card.compact : undefined);
  }, [card.compact]);

  const isCompact = (compactLocal ?? columnCompactOverride) === true;
  const isDone = card.column === "CONCLUIDO";
  const qtdConcluida = Number(card.qtdConcluida || 0);
  const restante = remainingPieces(card);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging: draggingInternal } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  } as React.CSSProperties;

  const barColor = deadlineColor(card, isDone);

  const toggleCompact = () => {
    const newValue = !isCompact;
    setCompactLocal(newValue);
    onToggleCompact?.(card.id, newValue);
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={clsx(
        "relative group bg-white border rounded-xl shadow-sm overflow-hidden",
        (draggingInternal || dragging) && "ring-2 ring-blue-400 scale-[1.02]"
      )}
      data-card-id={card.id}
    >
      <div className={clsx("absolute left-0 top-0 h-full w-1", barColor)} />

      {isCompact ? (
        // === MODO COMPACTO ===
        <div
          className="flex items-center gap-2 px-3 py-2 cursor-pointer"
          onDoubleClick={toggleCompact}
          title="Duplo clique para expandir"
        >
          <div
            {...listeners}
            {...attributes}
            className="p-1 rounded cursor-grab active:cursor-grabbing hover:bg-slate-100"
          >
            <Move size={16} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm truncate">Núm.: {card.numero}</span>
              <span className={getTipoBadgeClass(card.tipo)}>{getTipoLabel(card.tipo)}</span>
              <span className={getPrioridadeBadgeClass(card.prioridade)}>
                {card.prioridade || "Normal"}
              </span>
            </div>
            <div className="text-xs text-slate-600 truncate mt-0.5">{card.descricao}</div>
            <div className="text-[11px] text-slate-500">
              {card.qtd} pcs · {qtdConcluida} ok · ⏳ {restante}
            </div>
          </div>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
            <button onClick={toggleCompact} className="p-1.5 hover:bg-slate-100 rounded">
              <ChevronDown size={16} />
            </button>
            {onEdit && <button onClick={onEdit} className="p-1.5 hover:bg-slate-100 rounded" title="Editar"><Pencil size={16} /></button>}
            {onDelete && (
              <button
                onClick={() => confirm("Excluir pedido?") && onDelete()}
                className="p-1.5 hover:bg-slate-100 rounded text-red-600"
                title="Excluir"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      ) : (
        // === MODO DETALHADO ===
        <div className="flex">
          <div className="w-12 bg-slate-50 border-r flex flex-col items-center py-3 gap-3">
            <button onClick={toggleCompact} className="p-1.5 hover:bg-slate-200 rounded" title="Modo Compacto">
              <ChevronUp size={18} />
            </button>
            <div {...listeners} {...attributes} className="p-1.5 cursor-grab active:cursor-grabbing hover:bg-slate-200 rounded">
              <Move size={18} />
            </div>
            {onEdit && <button onClick={onEdit} className="p-1.5 hover:bg-slate-200 rounded" title="Editar"><Pencil size={18} /></button>}
            {onDelete && (
              <button
                onClick={() => confirm("Excluir pedido?") && onDelete()}
                className="p-1.5 hover:bg-slate-200 rounded text-red-600"
                title="Excluir"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>

          <div className="flex-1 p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-lg">Pedido #{card.numero}</div>
                <div className="text-sm text-slate-500">{card.descricao}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={getTipoBadgeClass(card.tipo)}>{getTipoLabel(card.tipo)}</span>
                <span className={getPrioridadeBadgeClass(card.prioridade)}>
                  {card.prioridade || "Normal"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <div><span className="font-medium text-slate-500">Emissão:</span> {fmtDate(card.emissao)}</div>
              <div><span className="font-medium text-slate-500">Entrega:</span> {fmtDate(card.entrega)}</div>
              <div><span className="font-medium text-slate-500">Total:</span> <b>{card.qtd}</b> peças</div>
              <div><span className="font-medium text-slate-500">Concluído:</span> {qtdConcluida} peças</div>
              <div><span className="font-medium text-slate-500">Restante:</span> <b className="text-orange-600">{restante}</b></div>
            </div>

            {card.tags && card.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {card.tags.map((tag, i) => (
                  <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}