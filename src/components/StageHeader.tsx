// src/components/StageHeader.tsx
import React from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import type { ColumnKey } from "../types";
import { useUIStore } from "../store/uiContext";

type Props = {
  title: string;
  columnIds: ColumnKey[];         // todas as colunas pertencentes à etapa
  rightExtra?: React.ReactNode;   // opcional: algo a mais do lado direito
};

export default function StageHeader({ title, columnIds, rightExtra }: Props) {
  const setManyRails = useUIStore(s => s.setManyRails);
  const toggleByIds = useUIStore(s => s.toggleRailsByIds);

  return (
    <div className="flex items-center gap-2 px-3 py-2 mb-2 bg-slate-100 border border-slate-200 rounded-lg">
      <h4 className="font-semibold text-sm">{title}</h4>

      <div className="ml-auto flex items-center gap-1">
        {/* Recolher todas (vira trilho) */}
        <button
          onClick={() => setManyRails(columnIds, true)}
          title="Recolher todas as colunas da etapa (trilho)"
          className="p-1.5 rounded hover:bg-slate-200"
        >
          <PanelRightClose size={18} />
        </button>

        {/* Expandir todas (volta ao normal) */}
        <button
          onClick={() => setManyRails(columnIds, false)}
          title="Expandir todas as colunas da etapa"
          className="p-1.5 rounded hover:bg-slate-200"
        >
          <PanelRightOpen size={18} />
        </button>

        {/* Alternar (se quiser uma tecla só para inverter o estado do grupo) */}
        {/* <button
          onClick={() => toggleByIds(columnIds)}
          title="Alternar estado (trilho/expandida) de todas as colunas da etapa"
          className="p-1.5 rounded hover:bg-slate-200"
        >
          <SwitchCamera size={18} />
        </button> */}
        {rightExtra}
      </div>
    </div>
  );
}
