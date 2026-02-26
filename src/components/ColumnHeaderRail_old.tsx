// src/components/ColumnHeaderRail.tsx
import { PanelRightClose } from "lucide-react";
import { useUIStore } from "../store/uiContext"; // <- relativo
import type { Card as CardType, ColumnKey } from "../types";
import { remainingPieces } from "../utils";
import "./rail.css";

type Props = {
  columnId: ColumnKey;
  title: string;
  cards: CardType[];
  wipLimit?: number | null;
  piecesTotal?: number;
};

export function ColumnHeaderRail({ columnId, title, cards, wipLimit, piecesTotal }: Props) {
  const toggle = useUIStore(s => s.toggleColumnRail);
  const pedidos = cards.length;
  const pecas = piecesTotal ?? cards.reduce((acc, c) => acc + remainingPieces(c as any), 0);
  const wipCurrent = pedidos; // ajuste se necessário
  const wipText = wipLimit ? `${wipCurrent}/${wipLimit}` : String(wipCurrent);

  return (
    <div className="rail" aria-expanded="false">
      {/* botão para EXPANDIR a coluna (fica no topo do trilho) */}
      <button
        className="rail__toggle"
        onClick={() => toggle(columnId)}
        aria-label="Expandir coluna"
        title="Expandir coluna"
      >
        <PanelRightClose size={18} />
      </button>

      {/* ORDEM: P | Q | W | Nome */}
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

      {/* Nome da coluna por último (vertical) */}
      <div className="rail__title" title={title}>{title}</div>
    </div>
  );
}

// → Export default também, para suportar import default se preferir
export default ColumnHeaderRail;
