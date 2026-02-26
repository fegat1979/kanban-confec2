// FILE: src/routes/NoAccess.tsx
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, signInWithGoogle } from "../lib/firebase";
import { requestAccess } from "../services/members";
import { LogIn } from "lucide-react";
import { db } from "../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

const USE_FB = String(import.meta.env.VITE_USE_FIREBASE) === "1";
const BOARD_ID = import.meta.env.VITE_BOARD_ID || "default";

export function NoAccess() {
  const [user, setUser] = useState<any>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    if (!USE_FB || !user) { setPending(false); return; }
    const ref = doc(db, "boards", BOARD_ID, "joinRequests", user.uid);
    const unsub = onSnapshot(ref, (snap) => setPending(snap.exists()));
    return () => unsub();
  }, [user]);

  async function handleRequest() {
    if (!user) return;
    await requestAccess(BOARD_ID, user);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white border rounded-2xl p-8 shadow-sm w-full max-w-md text-center space-y-4">
        <h1 className="text-lg font-semibold">Acesso não autorizado</h1>
        <p className="text-slate-600 text-sm">
          Sua conta não está autorizada a acessar este quadro.
        </p>

        {!USE_FB ? (
          <p className="text-xs text-slate-500">Ambiente local não requer autorização.</p>
        ) : !user ? (
          <button
            onClick={signInWithGoogle}
            className="inline-flex items-center gap-2 w-full justify-center bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg"
            title="Entrar com Google"
          >
            <LogIn size={18} /> Entrar com Google
          </button>
        ) : pending ? (
          <div className="text-sm text-slate-600">
            Pedido enviado. Aguarde aprovação do administrador.
          </div>
        ) : (
          <button
            onClick={handleRequest}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg"
          >
            Solicitar acesso
          </button>
        )}
      </div>
    </div>
  );
}
