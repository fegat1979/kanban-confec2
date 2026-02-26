// FILE: src/App.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { Settings } from "./routes/Settings";
import { Login } from "./routes/Login";
import { NoAccess } from "./routes/NoAccess";
import AdminMembers from "./routes/AdminMembers";
import { Board } from "./components/Board";
import { allOpenTotals } from "./utils";
import { demoCards } from "./data";
import { loadCards, saveCards } from "./storage";
import { Plus, Settings as Gear, LogIn, LogOut } from "lucide-react";
import type { Card, TipoPedido } from "./types";
import { UpsertModal } from "./components/UpsertModal";
// Firebase data
import { subscribeCards, setCard, removeCard } from "./services/cards";
// Firebase auth
import { auth, signInWithGoogle, signOutApp } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
// Membership (RBAC)
import { subscribeMemberRole, type MemberRole } from "./services/members";

// Flags
const USE_FB = String(import.meta.env.VITE_USE_FIREBASE) === "1";
const BOARD_ID = import.meta.env.VITE_BOARD_ID || "default";

export default function App() {
  const navigate = useNavigate();

  // ---------- Auth ----------
  const [user, setUser] = useState<any>(null);
  const [authReady, setAuthReady] = useState(!USE_FB); // em local, já "pronto"
  useEffect(() => {
    if (!USE_FB) return;
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setAuthReady(true); });
    return () => unsub();
  }, []);

  // ---------- Membership (role) ----------
  // role: undefined => ainda carregando | null => não é membro | 'viewer' | 'editor' | 'admin'
  const [role, setRole] = useState<MemberRole | null | undefined>(!USE_FB ? "admin" : undefined);
  const [memberError, setMemberError] = useState<any>(null);

  useEffect(() => {
    if (!USE_FB) return;
    setMemberError(null);

    if (!user) {
      // deslogado: considere "não-membro" e marque como resolvido
      setRole(null);
      return;
    }

    // Só marcamos resolvido quando chegar o primeiro snapshot
    const unsub = subscribeMemberRole(
      BOARD_ID,
      user.uid,
      (r) => { setRole(r); },          // r pode ser null (não-membro) ou 'viewer' | 'editor' | 'admin'
      (err) => { setMemberError(err); setRole(null); }
    );
    return () => unsub();
  }, [user]);

  // ---------- Fonte única de dados ----------
  const [cards, setCards] = useState<Card[]>([]);
  useEffect(() => {
    if (USE_FB) {
      // nunca iniciar do localStorage quando estiver no Firebase
      try { localStorage.removeItem("kanban-cards-v1"); } catch {}

      // sem login ou sem membership: não assina e zera a tela
      if (!user || !role) { setCards([]); return; }

      const unsub = subscribeCards(BOARD_ID, (arr) => setCards(arr));
      return () => unsub();
    } else {
      // modo local
      const saved = loadCards();
      if (saved?.length) setCards(saved);
      else { const seed = demoCards(); saveCards(seed); setCards(seed); }
    }
  }, [user, role]);

  // ---------- UI state ----------
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Card | null>(null);

  // -------- Filtro por TIPO (para UI + totais + board) --------
  const TIPO_OPTIONS: { value: TipoPedido; label: string }[] = useMemo(
    () => [
      { value: "CASUAL", label: "Casual" },
      { value: "ESCOLAR", label: "Escolar" },
      { value: "PRONTA_ENTREGA", label: "Pronta Entrega" },
      { value: "ATENDIMENTO", label: "Atendimento" },
      { value: "ESPORTIVO", label: "Esportivo" },
    ],
    []
  );

  const [tipoOpen, setTipoOpen] = useState(false);
  const [selectedTipos, setSelectedTipos] = useState<TipoPedido[]>([]);
  const [draftTipos, setDraftTipos] = useState<TipoPedido[]>([]);

  useEffect(() => {
    function onDocClick() {
      setTipoOpen(false);
    }
    if (!tipoOpen) return;
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [tipoOpen]);

  const visibleCards = useMemo(() => {
    if (!selectedTipos.length) return cards;
    const set = new Set(selectedTipos);
    return cards.filter((c: any) => set.has(((c as any).tipo || "CASUAL") as TipoPedido));
  }, [cards, selectedTipos]);

  const totals = useMemo(() => allOpenTotals(visibleCards), [visibleCards]);
  const canWrite = !USE_FB || (role === "admin" || role === "editor");

  // ---------- CRUD ----------
  async function onSave(card: Card) {
    if (USE_FB) {
      if (!canWrite) { alert("Sem permissão para salvar."); return; }
      try { await setCard(BOARD_ID, card); }
      catch (e: any) { alert(`Falha ao salvar no Firebase: ${e?.code || e?.message || e}`); console.error(e); return; }
    } else {
      setCards(prev => {
        const exists = prev.some(c => c.id === card.id);
        const next = exists ? prev.map(c => c.id === card.id ? card : c) : [card, ...prev];
        saveCards(next); return next;
      });
    }
    setModalOpen(false); setEditing(null);
  }

  async function onDelete(id: string) {
    if (USE_FB) {
      if (!canWrite) { alert("Sem permissão para excluir."); return; }
      try { await removeCard(BOARD_ID, id); setCards(prev => prev.filter(c => c.id !== id)); }
      catch (e: any) { alert(`Falha ao excluir no Firebase: ${e?.code || e?.message || e}`); console.error(e); }
    } else {
      setCards(prev => { const next = prev.filter(c => c.id !== id); saveCards(next); return next; });
    }
  }

  const allTags = useMemo(() => {
  const set = new Set<string>();
  for (const c of cards) (c.tags ?? []).forEach(t => { const v = t.trim(); if (v) set.add(v); });
  return Array.from(set).sort((a,b)=>a.localeCompare(b,"pt-BR"));
}, [cards]);

  // ---------- Route helpers ----------
  const RequireAuth = ({ children }: { children: JSX.Element }) => {
    if (!USE_FB) return children;
    if (!authReady) return <div className="p-6">Carregando…</div>;
    return user ? children : <Navigate to="/login" replace />;
  };

  // Importante: não navegar para /no-access enquanto role ainda está "undefined"
  const RequireMember = ({ children }: { children: JSX.Element }) => {
    if (!USE_FB) return children;
    if (role === undefined) return <div className="p-6">Verificando acesso…</div>;
    if (memberError) {
      return (
        <div className="p-6">
          <div className="text-red-600 font-medium mb-2">Erro ao verificar acesso.</div>
          <div className="text-sm text-slate-600">{String(memberError?.code || memberError?.message || memberError)}</div>
        </div>
      );
    }
    return role ? children : <Navigate to="/no-access" replace />;
  };

  const RequireAdmin = ({ children }: { children: JSX.Element }) => {
    if (!USE_FB) return children;
    if (role === undefined) return <div className="p-6">Verificando…</div>;
    return role === "admin" ? children : <Navigate to="/no-access" replace />;
  };

  // Quando o usuário se torna membro, esta rota redireciona para "/"
  const NoAccessGate = () => {
    if (!USE_FB) return <NoAccess />;
    if (role) return <Navigate to="/" replace />;
    return <NoAccess />;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-stage-bar text-white">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center gap-3">
          <h1 className="text-lg md:text-xl font-semibold">Kanban – Fluxo de Produção</h1>

          <div className="ml-auto flex items-center gap-3 text-sm">
            {/* Badge de modo/ambiente/board/role */}
            <span className="hidden sm:inline text-xs bg-white/10 rounded px-2 py-1">
              {USE_FB ? "Modo: Firebase" : "Modo: Local"} • {import.meta.env.MODE} • board: {BOARD_ID} • role: {role ?? "…"}
            </span>

            {/* Resumo só quando autorizado */}
            {(!USE_FB || role) && (
              <div className="hidden sm:flex gap-2">
                <span className="opacity-80">Resumo (em aberto):</span>
                <span className="bg-white/10 rounded px-2 py-1">QTD PED: <b>{totals.pedidos}</b></span>
                <span className="bg-white/10 rounded px-2 py-1">QTD PÇS: <b>{totals.pecas}</b></span>
              </div>
            )}

            {/* Filtro por TIPO (fixo no topo) */}
            {(!USE_FB || role) && (
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTipoOpen((v) => {
                      const next = !v;
                      if (!v && next) setDraftTipos(selectedTipos);
                      return next;
                    });
                  }}
                  className="text-sm px-3 py-1.5 rounded bg-white/10 hover:bg-white/15 border border-white/10 flex items-center gap-2"
                  title="Filtrar pedidos por tipo"
                >
                  <span>
                    Tipo: <b>{selectedTipos.length === 0 ? "Todos" : selectedTipos.length === 1 ? "1 selecionado" : `${selectedTipos.length} selecionados`}</b>
                  </span>
                  <span className="opacity-80">▼</span>
                </button>

                {tipoOpen ? (
                  <div
                    className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white shadow-lg p-3 z-50 text-slate-800"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <div className="text-xs font-semibold text-slate-600 mb-2">Selecionar tipos</div>

                    <div className="space-y-2">
                      {TIPO_OPTIONS.map((o) => {
                        const checked = draftTipos.includes(o.value);
                        return (
                          <label key={o.value} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const on = e.target.checked;
                                setDraftTipos((prev) =>
                                  on ? Array.from(new Set([...prev, o.value])) : prev.filter((x) => x !== o.value)
                                );
                              }}
                            />
                            <span>{o.label}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDraftTipos([]);
                          setSelectedTipos([]);
                          setTipoOpen(false);
                        }}
                        className="text-sm px-3 py-1.5 rounded border bg-white hover:bg-slate-50"
                      >
                        Limpar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTipos(draftTipos);
                          setTipoOpen(false);
                        }}
                        className="text-sm px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Adicionar */}
            <button
              disabled={!canWrite}
              title={!canWrite ? "Sem permissão para adicionar" : "Adicionar Pedido"}
              onClick={() => { setEditing(null); setModalOpen(true); }}
              className="inline-flex items-center gap-2 bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-emerald-600 text-white px-3 py-1.5 rounded"
            >
              <Plus size={18} /> <span className="hidden sm:inline">Adicionar Pedido</span>
            </button>

            {/* Configurações */}
            <button
              onClick={() => navigate("/settings")}
              className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded"
              title="Configurações"
            >
              <Gear size={18} /> <span className="hidden sm:inline">Configurações</span>
            </button>

            {/* Admin (apenas para role=admin) */}
            {USE_FB && role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded"
                title="Admin"
              >
                Admin
              </button>
            )}

            {/* Entrar/Sair */}
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
          {/* Rotas públicas (telas auxiliares) */}
          <Route path="/login" element={<Login />} />
          <Route path="/no-access" element={<NoAccessGate />} />

          {/* Rotas protegidas */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <RequireMember>
                  <Board
                    cards={cards}
                    setCards={setCards}
                    selectedTipos={selectedTipos}
                    onEdit={(c) => { setEditing(c); setModalOpen(true); }}
                    onDelete={onDelete}
                  />
                </RequireMember>
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <RequireMember>
                  <Settings />
                </RequireMember>
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <RequireMember>
                  <RequireAdmin>
                    <AdminMembers />
                  </RequireAdmin>
                </RequireMember>
              </RequireAuth>
            }
          />
        </Routes>
      </main>

      {modalOpen && (
        <UpsertModal
          initial={editing || undefined}
          existingTags={allTags}          // << NOVO
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSave={onSave}
        />
      )}
    </div>
  );
}
