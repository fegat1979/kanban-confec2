// src/components/ColumnHeaderRail.tsx
import React from "react";
import { PanelRightClose } from "lucide-react";
import { useUIStore } from "../store/uiContext";
import type { Card, ColumnKey } from "../types";
import { remainingPieces } from "../utils";
import "./rail.css";   // ← isso traz de volta o visual elegante com bordas e sombras

type Props = {
  columnId: ColumnKey;
  title: string;
  cards: Card[];
  wipLimit?: number | null;
  piecesTotal?: number;
};

export function ColumnHeaderRail({ columnId, title, cards, wipLimit, piecesTotal }: Props) {
  const toggle = useUIStore((s) => s.toggleColumnRail);

  const pedidos = cards.length;
  const pecas = piecesTotal ?? cards.reduce((acc, card) => acc + remainingPieces(card), 0);
  const wipText = wipLimit ? `${pedidos}/${wipLimit}` : String(pedidos);

  return (
    <div className="rail" aria-expanded="false">
      {/* Botão para expandir */}
      <button
        className="rail__toggle"
        onClick={() => toggle(columnId)}
        title="Expandir coluna"
      >
        <PanelRightClose size={18} />
      </button>

      {/* Métricas verticais */}
      <div className="rail__metric">
        <div className="rail__metric-key">P</div>
        <div className="rail__metric-val">{pedidos}</div>
      </div>

      <div className="rail__metric">
        <div className="rail__metric-key">Q</div>
        <div className="rail__metric-val">{pecas.toLocaleString("pt-BR")}</div>
      </div>

      <div className="rail__sep"></div>

      <div className="rail__metric">
        <div className="rail__metric-key">W</div>
        <div className="rail__metric-val">{wipText}</div>
      </div>

      <div className="rail__sep">•</div>

      {/* NOME DO SETOR - DE CIMA PARA BAIXO (corrigido) */}
      <div 
        className="rail__title" 
        title={title}
      >
        {title}
      </div>
    </div>
  );
}

export default ColumnHeaderRail;