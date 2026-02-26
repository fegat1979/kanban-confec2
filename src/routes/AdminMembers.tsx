// FILE: src/routes/AdminMembers.tsx
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import {
  subscribeJoinRequests, subscribeMembers,
  approveJoinRequest, denyJoinRequest,
  setMemberRole, removeMember,
  type JoinRequest, type Member, type MemberRole
} from "../services/members";
import { ShieldCheck, UserX, CheckCircle2, XCircle, Crown, Users } from "lucide-react";

const USE_FB = String(import.meta.env.VITE_USE_FIREBASE) === "1";
const BOARD_ID = import.meta.env.VITE_BOARD_ID || "default";

export default function AdminMembers() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const [reqs, setReqs] = useState<JoinRequest[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (!USE_FB) return;
    const unsub1 = subscribeJoinRequests(BOARD_ID, setReqs);
    const unsub2 = subscribeMembers(BOARD_ID, setMembers);
    return () => { unsub1?.(); unsub2?.(); };
  }, []);

  if (!USE_FB) return <div className="p-6">Admin indisponível no modo local.</div>;

  async function onApprove(uid: string, role: MemberRole) {
    try { await approveJoinRequest(BOARD_ID, uid, role); }
    catch (e:any) { alert(`Falha ao aprovar: ${e?.code || e?.message || e}`); console.error(e); }
  }
  async function onDeny(uid: string) {
    try { await denyJoinRequest(BOARD_ID, uid); }
    catch (e:any) { alert(`Falha ao recusar: ${e?.code || e?.message || e}`); console.error(e); }
  }
  async function onRole(uid: string, role: MemberRole) {
    try { await setMemberRole(BOARD_ID, uid, role); }
    catch (e:any) { alert(`Falha ao alterar role: ${e?.code || e?.message || e}`); console.error(e); }
  }
  async function onRemove(uid: string) {
    if (!confirm("Remover este membro do board?")) return;
    try { await removeMember(BOARD_ID, uid); }
    catch (e:any) { alert(`Falha ao remover: ${e?.code || e?.message || e}`); console.error(e); }
  }

  return (
    <div className="max-w-[1000px] mx-auto p-4 space-y-8">
      <header className="flex items-center gap-3">
        <ShieldCheck className="text-emerald-600" />
        <h1 className="text-xl font-semibold">Administração do Board</h1>
      </header>

      {/* Pedidos de acesso */}
      <section className="bg-white border rounded-2xl p-4">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Users size={18} /> Pedidos de Acesso
          <span className="ml-2 text-xs px-2 py-0.5 rounded bg-slate-100">{reqs.length}</span>
        </h2>
        {reqs.length === 0 ? (
          <div className="text-slate-500 text-sm">Nenhum pedido pendente.</div>
        ) : (
          <div className="space-y-2">
            {reqs.map(r => (
              <div key={r.uid} className="flex items-center gap-3 border rounded-lg p-2">
                {r.photoURL ? <img src={r.photoURL} alt="" className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full bg-slate-200" />}
                <div className="flex-1">
                  <div className="text-sm font-medium">{r.displayName || r.email || r.uid}</div>
                  <div className="text-xs text-slate-500">{r.email}</div>
                </div>
                <select
                  id={`role-${r.uid}`}
                  className="border rounded px-2 py-1 text-sm"
                  defaultValue="viewer"
                  title="Defina a permissão ao aprovar"
                >
                  <option value="viewer">viewer (ler)</option>
                  <option value="editor">editor (ler/escrever)</option>
                  <option value="admin">admin (gerenciar)</option>
                </select>
                <button
                  onClick={() => onApprove(r.uid, (document.getElementById(`role-${r.uid}`) as HTMLSelectElement).value as MemberRole)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
                  title="Aprovar"
                >
                  <CheckCircle2 size={16} /> Aprovar
                </button>
                <button
                  onClick={() => onDeny(r.uid)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-600 text-white hover:bg-rose-700 text-sm"
                  title="Recusar"
                >
                  <XCircle size={16} /> Recusar
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Membros */}
      <section className="bg-white border rounded-2xl p-4">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Crown size={18} /> Membros
          <span className="ml-2 text-xs px-2 py-0.5 rounded bg-slate-100">{members.length}</span>
        </h2>

        {members.length === 0 ? (
          <div className="text-slate-500 text-sm">Nenhum membro ainda.</div>
        ) : (
          <div className="space-y-2">
            {members.map(m => (
              <div key={m.uid} className="flex items-center gap-3 border rounded-lg p-2">
                {m.photoURL ? <img src={m.photoURL} alt="" className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full bg-slate-200" />}
                <div className="flex-1">
                  <div className="text-sm font-medium">{m.displayName || m.email || m.uid}</div>
                  <div className="text-xs text-slate-500">{m.email} <span className="ml-2 opacity-60">UID: {m.uid}</span></div>
                </div>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={m.role}
                  onChange={(e) => onRole(m.uid, e.target.value as MemberRole)}
                >
                  <option value="viewer">viewer</option>
                  <option value="editor">editor</option>
                  <option value="admin">admin</option>
                </select>
                <button
                  onClick={() => onRemove(m.uid)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-700 text-white hover:bg-slate-600 text-sm"
                  title="Remover membro"
                >
                  <UserX size={16} /> Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
