// FILE: src/components/SortableCtx.tsx
import React from "react";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";

export function useSortableContext(ids: string[]) {
  return {
    SortableProvider: ({children}:{children: React.ReactNode}) => (
      <SortableContext items={ids} strategy={rectSortingStrategy}>{children}</SortableContext>
    )
  };
}
