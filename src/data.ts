// FILE: src/data.ts
import type { Card, ColumnKey, StageKey, WipLimits } from "./types";

export const STAGES: { key: StageKey; title: string; columns: ColumnKey[] }[] = [
  { key: "CALENDARIO", title: "Calendário de Pedidos", columns: [
    "JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"
  ]},
  { key: "PRE", title: "Etapas Intermediárias (Pré-Produção)", columns: [
    "AG_MP","AG_CORTE","GERAR_PED"
  ]},
  { key: "PROD", title: "Etapa de Produção", columns: [
    "PCP","DISTRIBUICAO","COSTURA","PINTURA","ESTAMPA_FILME","ARREMATE","EMBALAGEM","EXPEDICAO"
  ]},
  { key: "DONE", title: "Concluído", columns: ["CONCLUIDO"] },
];

export const COLUMN_TITLES: Record<ColumnKey, string> = {
  JAN: "JAN", FEV: "FEV", MAR: "MAR", ABR: "ABR", MAI: "MAI", JUN: "JUN",
  JUL: "JUL", AGO: "AGO", SET: "SET", OUT: "OUT", NOV: "NOV", DEZ: "DEZ",
  AG_MP: "Aguardando MP", AG_CORTE: "Aguardando Corte", GERAR_PED: "Gerar Pedido",
  PCP: "PCP", DISTRIBUICAO: "Distribuição", COSTURA: "Costura", PINTURA: "Pintura",
  ESTAMPA_FILME: "Estampa/Filme", ARREMATE: "Arremate", EMBALAGEM: "Embalagem", EXPEDICAO: "Expedição",
  CONCLUIDO: "Concluído",
};

export const DEFAULT_WIP: WipLimits = Object.fromEntries(
  (Object.keys(COLUMN_TITLES) as ColumnKey[]).map((k) => [k, null])
) as WipLimits;

export const demoCards = (): Card[] => [
];
