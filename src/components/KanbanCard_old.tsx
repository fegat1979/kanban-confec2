import React, { useEffect, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card as CardType } from "../types";
import { deadlineColor, fmtDate, remainingPieces } from "../utils";
import { Move, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";


const tipoLabel = (t?: any) => {
  const v = String(t || "CASUAL");
  if (v === "PRONTA_ENTREGA") return "PRONTA ENTREGA";
  return v;
};

const tipoBadgeClass = (t?: any) => {
  const v = String(t || "CASUAL");
  return clsx(
    "text-[11px] px-1.5 py-0.5 rounded-full",
    v === "CASUAL" && "bg-slate-200 text-slate-800",
    v === "ESCOLAR" && "bg-blue-100 text-blue-800",
    v === "PRONTA_ENTREGA" && "bg-emerald-100 text-emerald-800",
    v === "ATENDIMENTO" && "bg-orange-100 text-orange-800",
    v === "ESPORTIVO" && "bg-red-100 text-red-800"
  );
};

export function KanbanCard({
  card,
  onEdit,
  onDelete,
  /**
   * Estado padrão da coluna:
   * - true  => coluna compacta
   * - false => coluna expandida
   * Esse valor só é aplicado quando o card NÃO tem override (compactLocal === undefined).
   */
  columnCompactOverride,
  /**
   * Persistência/propagação opcional do override individual.
   * Chamada sempre que o usuário alterna o estado do card.
   */
  onToggleCompact,
  dragging,
}: {
  card: CardType;
  onEdit?: () => void;
  onDelete?: () => void;
  columnCompactOverride?: boolean;
  onToggleCompact?: (id: string, val: boolean | undefined) => void; // <- aceita undefined para "voltar a herdar"
  dragging?: boolean;
}) {
  /**
   * Override local do card:
   * - undefined => herda o estado da coluna (columnCompactOverride)
   * - true/false => força compacto/detalhado independentemente da coluna
   *
   * Inicialização: se existir card.compact boolean, usamos como override; senão, começamos herdando (undefined).
   */
  const [compactLocal, setCompactLocal] = useState<boolean | undefined>(
    typeof card.compact === "boolean" ? card.compact : undefined
  );
    useEffect(() => {
      setCompactLocal(typeof card.compact === "boolean" ? card.compact : undefined);
    }, [card.compact]);
  // Prioridade: override do card > estado da coluna > padrão (false)
  const compacted = (compactLocal ?? columnCompactOverride ?? false) === true;

  const isDone = card.column === "CONCLUIDO";
  const qtdConcluida = Number((card as any).qtdConcluida || 0);
  const restante = remainingPieces(card);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style = { transform: CSS.Translate.toString(transform), transition } as React.CSSProperties;
  const barColor = deadlineColor(card, isDone);

  /**
   * Alterna o override do card.
   * - Se next for boolean: define explicitamente o override (true/false).
   * - Se next for "clear" (via string) ou undefined: remove override e volta a herdar da coluna.
   * - Se next for omitido: alterna em cima do estado EFETIVO atual (compacted).
   */
  function toggleCompact(next?: boolean | "clear") {
    let newVal: boolean | undefined;

    if (next === "clear") {
      newVal = undefined; // volta a herdar
    } else if (typeof next === "boolean") {
      newVal = next; // define override explícito
    } else {
      // alterna baseado no estado efetivo atual
      newVal = !compacted;
    }

    setCompactLocal(newVal);
    onToggleCompact?.(card.id, newVal);
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={clsx(
        "relative group bg-white border rounded-xl shadow-sm overflow-hidden",
        (isDragging || dragging) && "ring-2 ring-blue-400"
      )}
      data-card-id={card.id}
      data-compact={compacted ? "1" : "0"}
    >
      <div className={clsx("absolute left-0 top-0 h-full w-1", barColor)} />

      {/* ===== MODO COMPACTO ===== */}
      {compacted ? (
        <div
          className="flex items-center gap-2 px-2 py-1.5"
          onDoubleClick={() => toggleCompact(false)}
          title="Duplo clique para detalhar"
        >
          <div
            {...listeners}
            {...attributes}
            className="shrink-0 p-1 rounded cursor-grab active:cursor-grabbing hover:bg-slate-100"
            title="Arrastar"
          >
            <Move size={16} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm truncate">Núm.: {card.numero}</span>
              <span className="ml-auto" />
              <span className={tipoBadgeClass((card as any).tipo)}>{tipoLabel((card as any).tipo)}</span>
              <span
                className={clsx(
                  "text-[11px] px-1.5 py-0.5 rounded-full",
                  card.prioridade === "Alta" && "bg-red-100 text-red-700",
                  card.prioridade === "Média" && "bg-amber-100 text-amber-700",
                  card.prioridade === "Baixa" && "bg-emerald-100 text-emerald-700"
                )}
              >
                {card.prioridade}
              </span>
            </div>
            <div className="text-xs text-slate-600 truncate">{card.descricao}</div>
            <div className="text-[11px] text-slate-500 truncate">
              {card.qtd} total · ✔ {Math.min(qtdConcluida, card.qtd)} · ⏳ {restante}
            </div>
          </div>

          <div className="ml-2 hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
            <button
              className="p-1.5 rounded hover:bg-slate-100"
              title="Detalhar"
              onClick={() => toggleCompact(false)}
            >
              <ChevronDown size={16} />
            </button>
            {onEdit && (
              <button
                className="p-1.5 rounded hover:bg-slate-100"
                title="Editar"
                onClick={onEdit}
              >
                <Pencil size={16} />
              </button>
            )}
            {onDelete && (
              <button
                className="p-1.5 rounded hover:bg-slate-100 text-red-600"
                title="Excluir"
                onClick={() => {
                  if (confirm("Confirma excluir o pedido?")) onDelete();
                }}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ===== MODO DETALHADO ===== */
        <div className="flex">
          <div className="w-10 flex flex-col items-center gap-2 p-2 border-r bg-slate-50">
            <button
              className="p-1 rounded hover:bg-slate-200"
              title="Compactar"
              onClick={() => toggleCompact(true)}
            >
              <ChevronUp size={18} />
            </button>
            <button
              className="p-1 rounded cursor-grab active:cursor-grabbing hover:bg-slate-200"
              title="Arrastar"
              {...listeners}
              {...attributes}
            >
              <Move size={18} />
            </button>
            {onEdit && (
              <button
                className="p-1 rounded hover:bg-slate-200"
                title="Editar"
                onClick={onEdit}
              >
                <Pencil size={18} />
              </button>
            )}
            {onDelete && (
              <button
                className="p-1 rounded hover:bg-slate-200 text-red-600"
                title="Excluir"
                onClick={() => {
                  if (confirm("Confirma excluir o pedido?")) onDelete();
                }}
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>

          <div className="flex-1 p-3 space-y-2 min-w-0">
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
              <div>
                <span className="font-semibold">Emi.:</span> {fmtDate(card.emissao)}
              </div>
              <div>
                <span className="font-semibold">Ent.:</span> {fmtDate(card.entrega)}
              </div>
              <div>
                <span className="font-semibold">Total:</span> {card.qtd}
              </div>
              <div>
                <span className="font-semibold">Concl.:</span> {Math.min(qtdConcluida, card.qtd)}
              </div>
              <div>
                <span className="font-semibold">Rest.:</span> {restante}
              </div>
              <div>
                <span className="font-semibold">⏰</span>{" "}
                {card.updatedAt ? fmtDate(card.updatedAt.substring(0, 10)) : "-"}
              </div>
            </div>

            {card.tags?.length ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {card.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] leading-4 px-2 py-0.5 rounded border bg-slate-50 text-slate-700"
                    title={`Tag: ${t}`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </article>
  );
}
