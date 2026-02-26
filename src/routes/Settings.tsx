import React, { useMemo, useState } from "react";
import { COLUMN_TITLES } from "../data";
import type { ColumnKey, WipLimits, StageKey, StageWidths } from "../types";
import { loadWip, saveWip, loadStageWidths, saveStageWidths } from "../storage";

export function Settings(){
  const [wip, setWip] = useState<WipLimits>(() => loadWip() || {} as WipLimits);
  const [widths, setWidths] = useState<StageWidths>(() => loadStageWidths() || {});
  const keys = useMemo(()=> Object.keys(COLUMN_TITLES) as ColumnKey[], []);

  function setW(key: ColumnKey, val: number | null){ setWip(prev => ({...prev, [key]: val})); }
  function setWidth(stage: StageKey, val: number){ setWidths(prev => ({...prev, [stage]: val})); }

  const getDefaultWidth = (s: StageKey) => (s === "PROD" ? 384 : s === "PRE" ? 352 : s === "DONE" ? 360 : 320);

  return (
    <div className="max-w-[900px] mx-auto p-4">
      <h2 className="text-xl font-semibold mb-3">Configurações do Quadro</h2>

      <div className="bg-white border rounded-2xl p-4 mb-6">
        <h3 className="font-semibold mb-2">Limites de WIP por Coluna</h3>
        <p className="text-sm text-slate-600 mb-4">Deixe em branco para ilimitado. Colunas com ≥ 80% do limite ficam em amarelo e ≥ 100% em vermelho.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {keys.map(k => (
            <label key={k} className="text-sm">
              {COLUMN_TITLES[k]}
              <input
                className="mt-1 w-full border rounded px-2 py-1"
                type="number"
                placeholder="∞"
                value={wip?.[k] ?? ""}
                onChange={e=> setW(k, e.target.value==="" ? null : Number(e.target.value))}
              />
            </label>
          ))}
        </div>
      </div>

      {/* >>> NOVO: Largura das Colunas (desktop) por ETAPA */}
      <div className="bg-white border rounded-2xl p-4">
        <h3 className="font-semibold mb-2">Largura das Colunas (desktop)</h3>
        <p className="text-sm text-slate-600 mb-4">
          Em dispositivos móveis (≤640px), as colunas usam ~90% da largura da tela automaticamente.
          Aqui você ajusta a largura base para telas maiores.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(["PRE","PROD","DONE"] as StageKey[]).map((stage) => (
            <label key={stage} className="text-sm">
              {stage === "PRE" ? "Pré-produção" : stage === "PROD" ? "Produção" : "Concluído"}
              <input
                className="mt-1 w-full border rounded px-2 py-1"
                type="number"
                min={320}
                max={520}
                step={8}
                value={widths?.[stage] ?? getDefaultWidth(stage)}
                onChange={(e)=> setWidth(stage, Number(e.target.value))}
              />
            </label>
          ))}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <a href="/" className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200">Voltar</a>
          <button className="px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={()=>{ saveWip(wip); saveStageWidths(widths); alert("Configurações salvas."); }}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
