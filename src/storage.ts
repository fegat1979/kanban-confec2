import type { Card, CollapseState, WipLimits, StageWidths } from "./types";

const LS = {
  CARDS: "kanban-cards-v1",
  WIP: "kanban-wip-v1",
  COLLAPSE: "kanban-collapse-v1",
  STAGE_WIDTHS: "kanban-stage-widths-v1", // <<< novo
};

export function loadCards(): Card[] {
  try {
    const raw = JSON.parse(localStorage.getItem(LS.CARDS) || "[]");
    if (!Array.isArray(raw)) return [];
    // Migração leve: garante defaults para campos novos (WIP real + histórico)
    return raw.map((c: any) => {
      const qtd = Number(c?.qtd || 0);
      const qtdConcluida = Number(c?.qtdConcluida || 0);
      const tipo = (c?.tipo || "CASUAL") as any;
      return {
        ...c,
        qtd,
        qtdConcluida: isFinite(qtdConcluida) ? Math.max(0, Math.min(qtdConcluida, qtd)) : 0,
        apontamentos: Array.isArray(c?.apontamentos) ? c.apontamentos : [],
        tipo,
      } as Card;
    });
  } catch {
    return [];
  }
}
export function saveCards(cards: Card[]) {
  localStorage.setItem(LS.CARDS, JSON.stringify(cards));
}

export function loadWip(): WipLimits {
  try { return JSON.parse(localStorage.getItem(LS.WIP) || "null") || null } catch { return null as any }
}
export function saveWip(wips: WipLimits) {
  localStorage.setItem(LS.WIP, JSON.stringify(wips));
}

export function loadCollapse(): CollapseState {
  try { return JSON.parse(localStorage.getItem(LS.COLLAPSE) || "{}") } catch { return {} as any }
}
export function saveCollapse(c: CollapseState) {
  localStorage.setItem(LS.COLLAPSE, JSON.stringify(c));
}

// >>> novo: larguras por etapa
export function loadStageWidths(): StageWidths {
  try { return JSON.parse(localStorage.getItem(LS.STAGE_WIDTHS) || "null") || {}; } catch { return {}; }
}
export function saveStageWidths(sw: StageWidths) {
  localStorage.setItem(LS.STAGE_WIDTHS, JSON.stringify(sw));
}
