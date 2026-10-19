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
  galleryPlaying: false,
  detailPlaying: false,
  galleryView: "intro",
  galleryPage: 0,
};
const Context = createContext<{
  state: GalleryState;
  update: (patch: Partial<GalleryState>) => void;
} | null>(null);

export const GalleryProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<GalleryState>(initial);

  const update = useCallback((patch: Partial<GalleryState>) => {
    setState((current) => ({
      ...current,
      ...patch,
    }));
  }, []);

  const value = useMemo(() => ({ state, update }), [state, update]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useGalleryState = () => {
  const value = useContext(Context);

  if (!value) {
    throw new Error("La galería necesita GalleryProvider.");
  }

  return value;
};
