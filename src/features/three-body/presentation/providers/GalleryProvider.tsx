"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { GalleryState } from "../../types/gallery.types";

// Estado inicial de la galería.
const initial: GalleryState = {
  scroll: 0,
  categoryFilter: "all",
  galleryPlaying: false,
  playingByOrbit: {},
  detailPlaying: false,
  galleryView: "intro",
  galleryPage: 0,
};

// Comparte el estado y las acciones de la galería.
const Context = createContext<{
  state: GalleryState;
  update: (patch: Partial<GalleryState>) => void;
  toggleOrbit: (slug: string) => void;
} | null>(null);

// Gestiona el estado compartido de la galería.
export const GalleryProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<GalleryState>(initial);

  // Actualiza las propiedades indicadas.
  const update = useCallback((patch: Partial<GalleryState>) => {
    setState((current) => ({ ...current, ...patch }));
  }, []);

  // Reproduce o pausa una órbita.
  const toggleOrbit = useCallback((slug: string) => {
    setState((current) => ({
      ...current,
      playingByOrbit: {
        ...current.playingByOrbit,
        [slug]: !current.playingByOrbit[slug],
      },
    }));
  }, []);

  const value = useMemo(
    () => ({ state, update, toggleOrbit }),
    [state, update, toggleOrbit],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

// Permite acceder al estado de la galería.
export const useGalleryState = () => {
  const value = useContext(Context);

  if (!value) {
    throw new Error("La galería necesita GalleryProvider.");
  }

  return value;
};
