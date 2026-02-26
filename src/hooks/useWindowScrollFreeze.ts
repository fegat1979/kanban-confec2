// src/hooks/useWindowScrollFreeze.ts
import { useRef } from "react";

/**
 * Congela e restaura o scroll da janela (viewport).
 * Use antes/depois de qualquer atualização de estado que altere o layout.
 */
export function useWindowScrollFreeze() {
  const yRef = useRef(0);

  const freeze = () => {
    yRef.current =
      window.scrollY ||
      document.documentElement.scrollTop ||
      0;
  };

  const thaw = () => {
    // após o reflow/pintura
    requestAnimationFrame(() => {
      window.scrollTo({
        top: yRef.current,
        left: 0,
        // "instant" evita animação; em alguns browsers pode cair como "auto"
        behavior: "instant" as ScrollBehavior,
      });
    });
  };

  return { freeze, thaw };
}
