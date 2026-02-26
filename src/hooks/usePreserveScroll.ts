// src/hooks/usePreserveScroll.ts
import { useRef } from "react";

export function usePreserveScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const snap = useRef({ top: 0, left: 0 });

  const take = () => {
    const el = ref.current;
    if (!el) return;
    snap.current.top = el.scrollTop;
    snap.current.left = el.scrollLeft;
  };

  const restore = () => {
    const el = ref.current;
    if (!el) return;
    // restaura após o reflow da UI
    requestAnimationFrame(() => {
      el.scrollTop = snap.current.top;
      el.scrollLeft = snap.current.left;
    });
  };

  return { ref, take, restore };
}
