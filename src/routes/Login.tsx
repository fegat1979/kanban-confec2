// FILE: src/routes/Login.tsx
import { LogIn } from "lucide-react";
import { signInWithGoogle } from "../lib/firebase";

export function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white border rounded-2xl p-8 shadow-sm w-full max-w-sm text-center">
        <h1 className="text-lg font-semibold mb-2">Acessar o Kanban</h1>
        <p className="text-slate-600 text-sm mb-6">
          Entre com sua conta Google para visualizar o quadro.
        </p>
        <button
          onClick={signInWithGoogle}
          className="inline-flex items-center gap-2 w-full justify-center bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg"
          title="Entrar com Google"
        >
          <LogIn size={18} /> Entrar com Google
        </button>
      </div>
    </div>
  );
}
