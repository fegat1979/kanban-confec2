// FILE: src/App.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Settings } from "./routes/Settings";
import { Board } from "./components/Board";
import { allOpenTotals } from "./utils";
import { demoCards } from "./data";
import { loadCards, saveCards } from "./storage";
import { Plus, Settings as Gear, LogIn, LogOut } from "lucide-react";
import type { Card } from "./types";
import { UpsertModal } from "./components/UpsertModal";

// Firebase
import { subscribeCards, setCard, removeCard } from "./services/cards";
import { auth, signInWithGoogle, signOutApp } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

// Flag de runtime: usa Firebase quando VITE_USE_FIREBASE=1
const USE_FB = String(import.meta.env.VITE_USE_FIREBASE) === "1";
const BOARD_ID = import.meta.env.VITE_BOARD_ID || "default";

export default function App() {
  const navigate = useNavigate();

  // Auth (apenas útil no modo Firebase)
  const [user, setUser] = useState<any>(null);
  useEffect(() => onAuthStateChanged(auth, setUser), []);

  // Fonte ÚNICA de dados (evita “fantasmas” do localStorage)
  const [cards, setCards] = useState<Card[]>([]);
  useEffect(() => {
    if (USE_FB) {
      // Garantia extra: não iniciar a UI com cópia local
      try { localStorage.removeItem("kanban-cards-v1"); } catch {}
      const unsub = subscribeCards(BOARD_ID, (arr) => {
        setCards(arr);               // Firestore é a fonte de verdade
        // (opcional) manter um backup local somente para leitura offline:
        // try { saveCards(arr); } catch {}
      });
      return () => unsub();
    } else {
      // Modo LOCAL: carrega do localStorage (ou semente)
      const saved = loadCards();
      if (saved?.length) setCards(saved);
      else { const seed = demoCards(); saveCards(seed); setCards(seed); }
    }
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Card | null>(null);

  const totals = useMemo(() => allOpenTotals(cards), [cards]); // ignora “Concluído”

  // Criar/atualizar card
  async function onSave(card: Card) {
    if (USE_FB) {
      try {
        await setCard(BOARD_ID, card);          // upsert no Firestore
      } catch (e: any) {
        alert(`Falha ao salvar no Firebase: ${e?.code || e?.message || e}`);
        console.error(e);
        return;
      }
    } else {
      setCards((prev) => {
        const exists = prev.some((c) => c.id === card.id);
        const next = exists ? prev.map((c) => (c.id === card.id ? card : c)) : [card, ...prev];
        saveCards(next);
        return next;
      });
    }
    setModalOpen(false);
    setEditing(null);
  }

  // Excluir card
  async function onDelete(id: string) {
    if (USE_FB) {
      try {
        await removeCard(BOARD_ID, id);         // delete no Firestore
        setCards((prev) => prev.filter((c) => c.id !== id)); // feedback imediato
      } catch (e: any) {
        alert(`Falha ao excluir no Firebase: ${e?.code || e?.message || e}`);
        console.error(e);
      }
    } else {
      setCards((prev) => {
        const next = prev.filter((c) => c.id !== id);
        saveCards(next);
        return next;
      });
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-stage-bar text-white">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center gap-3">
          <h1 className="text-lg md:text-xl font-semibold">Kanban – Fluxo de Produção</h1>

          <div className="ml-auto flex items-center gap-3 text-sm">
            {/* Badge de modo/ambiente/board */}
            <span className="hidden sm:inline text-xs bg-white/10 rounded px-2 py-1">
              {USE_FB ? "Modo: Firebase" : "Modo: Local"} • {import.meta.env.MODE} • board: {BOARD_ID}
            </span>

            <div className="hidden sm:flex gap-2">
              <span className="opacity-80">Resumo (em aberto):</span>
              <span className="bg-white/10 rounded px-2 py-1">QTD PED: <b>{totals.pedidos}</b></span>
              <span className="bg-white/10 rounded px-2 py-1">QTD PÇS: <b>{totals.pecas}</b></span>
            </div>

            <button
              disabled={USE_FB && !user}
              title={USE_FB && !user ? "Entre para adicionar" : "Adicionar Pedido"}
              onClick={() => { setEditing(null); setModalOpen(true); }}
              className="inline-flex items-center gap-2 bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-emerald-600 text-white px-3 py-1.5 rounded"
            >
              <Plus size={18} /> <span className="hidden sm:inline">Adicionar Pedido</span>
            </button>

            <button
              onClick={() => navigate("/settings")}
              className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded"
              title="Configurações"
            >
              <Gear size={18} /> <span className="hidden sm:inline">Configurações</span>
            </button>

            {/* Entrar/Sair (só faz sentido no modo Firebase) */}
            {USE_FB && (
              user ? (
                <button
                  onClick={() => signOutApp()}
                  className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded"
                  title="Sair"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Sair ({user.displayName?.split(" ")[0] || "Usuário"})</span>
                </button>
              ) : (
                <button
                  onClick={() => signInWithGoogle()}
                  className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded"
                  title="Entrar com Google"
                >
                  <LogIn size={16} />
                  <span className="hidden sm:inline">Entrar</span>
                </button>
              )
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <Board
                cards={cards}
                setCards={setCards}
                onEdit={(c) => { setEditing(c); setModalOpen(true); }}
                onDelete={onDelete}
              />
            }
          />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      {modalOpen && (
        <UpsertModal
          initial={editing || undefined}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSave={onSave}
        />
      )}
    </div>
  );
}
