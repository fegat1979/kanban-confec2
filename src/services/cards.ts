// src/services/cards.ts
import { collection, doc, onSnapshot, query, setDoc,
         deleteDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Card } from "../types";

// Coleção: boards/{boardId}/cards
function col(boardId: string) {
  return collection(db, "boards", boardId, "cards");
}

function toFirestore(c: Card) {
  // upsert: mantém 'order' (ou define um default) e atualiza 'updatedAt' no servidor
  const { id, ...rest } = c;
  return {
    ...rest,
    tags: Array.isArray(c.tags) ? c.tags : [],
    tipo: (c as any).tipo || "CASUAL",
    qtdConcluida: Number((c as any).qtdConcluida || 0),
    apontamentos: Array.isArray((c as any).apontamentos) ? (c as any).apontamentos : [],
    order: c.order ?? Date.now(),
    updatedAt: serverTimestamp(),
  };
}

function fromFirestore(id: string, data: any): Card {
  return {
    id,
    numero: data.numero,
    descricao: data.descricao,
    emissao: data.emissao,
    entrega: data.entrega,
    qtd: data.qtd,
    qtdConcluida: Number(data.qtdConcluida || 0),
    apontamentos: Array.isArray(data.apontamentos) ? data.apontamentos : [],
    prioridade: data.prioridade,
    updatedAt: typeof data.updatedAt?.toDate === "function"
      ? data.updatedAt.toDate().toISOString()
      : new Date().toISOString(),
    stage: data.stage,
    column: data.column,
    compact: data.compact ?? false,
    order: typeof data.order === "number" ? data.order : Number.MAX_SAFE_INTEGER,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    tipo: (data.tipo || "CASUAL") as any,
  };
}

// Assinatura em tempo real de TODOS os cards do board
export function subscribeCards(boardId: string, cb: (cards: Card[]) => void) {
  const q = query(col(boardId)); // ordenamos no cliente por 'order'
  return onSnapshot(q, (snap) => {
    const arr: Card[] = [];
    snap.forEach((d) => arr.push(fromFirestore(d.id, d.data())));
    cb(arr);
  });
}

// 🔹 Upsert (create/update) de um card
export async function setCard(boardId: string, c: Card) {
  const ref = doc(db, "boards", boardId, "cards", c.id);
  await setDoc(ref, toFirestore(c), { merge: true });
}

export async function removeCard(boardId: string, id: string): Promise<boolean> {
  try {
    const ref = doc(db, "boards", boardId, "cards", id);
    await deleteDoc(ref);
    if (import.meta.env.DEV) {
      console.log("[removeCard] OK", { boardId, id });
    }
    return true;
  } catch (e: any) {
    console.error("[removeCard] FAIL", { boardId, id, err: e?.code || e?.message || e });
    throw e;
  }
}

// Importa dados locais na 1ª vez (opcional)
export async function importIfEmpty(boardId: string, localCards: Card[]) {
  const snap = await getDocs(col(boardId));
  if (!snap.empty) return;
  await Promise.all(localCards.map((c) => setCard(boardId, c)));
}
