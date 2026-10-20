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

const initial: GalleryState = {
  scroll: 0,
  categoryFilter: "all",
  galleryPlaying: false,
  playingByOrbit: {},
  detailPlaying: false,
  galleryView: "intro",
  galleryPage: 0,
};
const Context = createContext<{
  state: GalleryState;
  update: (patch: Partial<GalleryState>) => void;
  toggleOrbit: (slug: string) => void;
} | null>(null);

export const GalleryProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<GalleryState>(initial);

  const update = useCallback((patch: Partial<GalleryState>) => {
    setState((current) => ({
      ...current,
      ...patch,
    }));
  }, []);

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

export const useGalleryState = () => {
  const value = useContext(Context);

  if (!value) {
    throw new Error("La galería necesita GalleryProvider.");
  }

  return value;
};
