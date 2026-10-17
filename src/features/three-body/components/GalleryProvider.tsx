"use client";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { OrbitDefinition } from "../domain/orbit";

export type Category = "Todas" | OrbitDefinition["category"];
interface GalleryState {
  query: string;
  category: Category;
  order: "curated" | "alphabetic";
  view: "grid" | "list";
  scroll: number;
  playing: boolean | null;
}
const initial: GalleryState = {
  query: "",
  category: "Todas",
  order: "curated",
  view: "grid",
  scroll: 0,
  playing: null,
};
const Context = createContext<{
  state: GalleryState;
  update: (patch: Partial<GalleryState>) => void;
} | null>(null);
export function GalleryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GalleryState>(initial);
  const update = useCallback((patch: Partial<GalleryState>) => {
    setState((current) => ({ ...current, ...patch }));
  }, []);
  const value = useMemo(() => ({ state, update }), [state, update]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useGalleryState() {
  const value = useContext(Context);
  if (!value) throw new Error("La galería necesita GalleryProvider.");
  return value;
}
