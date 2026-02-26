// src/hooks/useSingleSessionGuard.ts
import { useEffect } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // se você usa react-router

export function useSingleSessionGuard(onKicked?: () => void) {
  const navigate = useNavigate?.();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // foi deslogado (perdeu sessão, logout, etc.)
        onKicked?.();
        if (navigate) navigate("/login");
      }
    });
    return () => unsub();
  }, [navigate, onKicked]);
}
