// src/auth/session.ts
import { auth, db, provider } from "../lib/firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

/** LOGIN GOOGLE com “sessão única” (soft) */

export async function signInSingleSessionGoogle() {
  const cred = await signInWithPopup(auth, provider);
  const user = cred.user;
  const ref = doc(db, "active_sessions", user.uid);

  // 1) Tenta ler a sessão existente
  const snap = await getDoc(ref);
  const localSessionId = localStorage.getItem("kanban_sessionId") || undefined;

  if (!snap.exists()) {
    // 2) Não existe → cria a sessão normalmente
    const newSessionId = crypto.randomUUID();
    try {
      await setDoc(ref, {
        sessionId: newSessionId,
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
      }, { merge: false });
      localStorage.setItem("kanban_sessionId", newSessionId);
      return user;
    } catch {
      // corrida rara: alguém criou no mesmo instante → trata como “já ativa”
      await signOut(auth);
      localStorage.removeItem("kanban_sessionId");
      throw new Error("Sessão já ativa para este usuário. Encerre a sessão anterior para entrar.");
    }
  }

  // 3) Já existe doc: verifica se é a MESMA sessão deste navegador
  const data = snap.data() as { sessionId?: string };
  const serverSessionId = data?.sessionId;

  if (serverSessionId && localSessionId && serverSessionId === localSessionId) {
    // Mesmo navegador/sessão → apenas faz um ping e segue
    try {
      await updateDoc(ref, {
        sessionId: serverSessionId,
        lastSeen: serverTimestamp(),
      });
      return user;
    } catch {
      // se der algo errado nas rules, faz signOut por segurança
      await signOut(auth);
      localStorage.removeItem("kanban_sessionId");
      throw new Error("Não foi possível retomar a sessão. Tente novamente.");
    }
  }

  // 4) Caso contrário, é outro dispositivo/sessão → BLOQUEIA (soft mode)
  await signOut(auth);
  localStorage.removeItem("kanban_sessionId");
  throw new Error("Sessão já ativa para este usuário. Encerre a sessão anterior para entrar.");
}