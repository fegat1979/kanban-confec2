// useBoardLayout.ts
import { useEffect, useState, useRef } from "react";

export function useBoardLayout({ desiredColsVisible = 10, min = 300, max = 520, gap = 16 } = {}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [colWidth, setColWidth] = useState<number>(360);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const compute = () => {
      const w = el.clientWidth || window.innerWidth;
      const width = Math.max(min, Math.min(max, Math.floor((w - gap * (desiredColsVisible - 1)) / desiredColsVisible)));
      setColWidth(width);
      el.style.setProperty("--col-w", `${width}px`);
      el.style.setProperty("--gap", `${gap}px`);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener("orientationchange", compute);
    return () => { ro.disconnect(); window.removeEventListener("orientationchange", compute); };
  }, [desiredColsVisible, min, max, gap]);

  return { ref, colWidth };
}
