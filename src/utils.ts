import type { Card, ColumnKey } from "./types";
import { format, parseISO, differenceInCalendarDays } from "date-fns";

export function fmtDate(d: string) { try { return format(parseISO(d), "dd/MM/yyyy"); } catch { return d; } }
export function daysToDelivery(card: Card) {
  return differenceInCalendarDays(parseISO(card.entrega), new Date());
}
export function deadlineColor(card: Card, isDone: boolean) {
  if (isDone) return "bg-green-500";
  const d = daysToDelivery(card);
  if (d > 2) return "bg-blue-500";
  if (d >= 0) return "bg-yellow-500";
  return "bg-red-500";
}

export function remainingPieces(card: Card): number {
  const total = Number(card.qtd || 0);
  const done = Number((card as any).qtdConcluida || 0);
  const rem = total - done;
  return isFinite(rem) ? Math.max(0, rem) : 0;
}

export function columnTotals(cards: Card[], column: ColumnKey) {
  const list = cards.filter(c => c.column === column);
  return { pedidos: list.length, pecas: list.reduce((s,c)=>s+remainingPieces(c),0) };
}
export function stageTotals(cards: Card[], columns: ColumnKey[]) {
  const list = cards.filter(c => columns.includes(c.column));
  return { pedidos: list.length, pecas: list.reduce((s,c)=>s+remainingPieces(c),0) };
}

// >>> novo: soma apenas “não concluídos”
export function allOpenTotals(cards: Card[]) {
  const list = cards.filter(c => c.column !== "CONCLUIDO");
  return { pedidos: list.length, pecas: list.reduce((s,c)=>s+remainingPieces(c),0) };
}
