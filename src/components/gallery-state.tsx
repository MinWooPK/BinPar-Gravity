"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
export type Category = "Todas" | "Clásica" | "Coreografía" | "Periódica";
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
  return (
    <Context.Provider
      value={{
        state,
        update: (patch) => setState((current) => ({ ...current, ...patch })),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useGalleryState() {
  const value = useContext(Context);
  if (!value) throw new Error("La galería necesita GalleryProvider.");
  return value;
}
