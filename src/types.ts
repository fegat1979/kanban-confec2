export type Priority = "Baixa" | "Média" | "Alta";

export type TipoPedido =
  | "CASUAL"
  | "ESCOLAR"
  | "PRONTA_ENTREGA"
  | "ATENDIMENTO"
  | "ESPORTIVO";

export type StageKey = "CALENDARIO" | "PRE" | "PROD" | "DONE";

export type ColumnKey =
  | "JAN" | "FEV" | "MAR" | "ABR" | "MAI" | "JUN" | "JUL" | "AGO" | "SET" | "OUT" | "NOV" | "DEZ"
  | "AG_MP" | "AG_CORTE" | "GERAR_PED"
  | "PCP" | "DISTRIBUICAO" | "COSTURA" | "PINTURA" | "ESTAMPA_FILME" | "ARREMATE" | "EMBALAGEM" | "EXPEDICAO"
  | "CONCLUIDO";

export type Apontamento = {
  id: string;
  /** ISO string (UTC) */
  at: string;
  /** Quantidade concluída neste apontamento (incremento). */
  qtd: number;
  /** Observação opcional. */
  note?: string;
};

export type Card = {
  id: string;
  numero: string;
  descricao: string;
  emissao: string;
  entrega: string;
  qtd: number;
  /** Quantidade concluída (acumulada). O WIP real usa (qtd - qtdConcluida). */
  qtdConcluida?: number;
  /** Histórico de apontamentos incrementais de produção concluída. */
  apontamentos?: Apontamento[];
  prioridade: Priority;
  updatedAt: string;
  stage: StageKey;
  column: ColumnKey;
  compact?: boolean;
  order?: number;      // << posição dentro da coluna (menor = mais alto)
  tags?: string[];     // << NOVO
  /** Tipo do pedido (mix de negócio). */
  tipo?: TipoPedido;
};


export type WipLimits = Record<ColumnKey, number | null>;

export type CollapseState = {
  stages: Partial<Record<StageKey, boolean>>;
  columns: Partial<Record<ColumnKey, boolean>>;
};

// >>> novo: largura por ETAPA (desktop)
export type StageWidths = Partial<Record<StageKey, number>>;
