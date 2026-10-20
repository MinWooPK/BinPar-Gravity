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

// Define el estado inicial de la galería, incluyendo filtros,
// reproducción de órbitas, navegación y desplazamiento.
const initial: GalleryState = {
  scroll: 0,
  categoryFilter: "all",
  galleryPlaying: false,
  playingByOrbit: {},
  detailPlaying: false,
  galleryView: "intro",
  galleryPage: 0,
};

// Crea el contexto para compartir el estado de la galería
// y las funciones que permiten modificarlo.
const Context = createContext<{
  state: GalleryState;
  update: (patch: Partial<GalleryState>) => void;
  toggleOrbit: (slug: string) => void;
} | null>(null);

// Gestiona el estado compartido de la galería de órbitas,
// conservando los filtros, la reproducción y la navegación.
export const GalleryProvider = ({ children }: { children: ReactNode }) => {
  // Almacena el estado actual de la galería.
  const [state, setState] = useState<GalleryState>(initial);

  // Actualiza únicamente las propiedades indicadas del estado.
  const update = useCallback((patch: Partial<GalleryState>) => {
    setState((current) => ({
      ...current,
      ...patch,
    }));
  }, []);

  // Alterna entre reproducir y pausar una órbita concreta.
  const toggleOrbit = useCallback((slug: string) => {
    setState((current) => ({
      ...current,
      playingByOrbit: {
        ...current.playingByOrbit,
        [slug]: !current.playingByOrbit[slug],
      },
    }));
  }, []);

  // Agrupa el estado y las funciones que se comparten mediante el contexto.
  const value = useMemo(
    () => ({ state, update, toggleOrbit }),
    [state, update, toggleOrbit],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

// Permite acceder al estado compartido de la galería
// y a sus funciones desde cualquier componente incluido en el Provider.
export const useGalleryState = () => {
  // Obtiene el contexto compartido de la galería.
  const value = useContext(Context);

  if (!value) {
    throw new Error("La galería necesita GalleryProvider.");
  }

  return value;
};
