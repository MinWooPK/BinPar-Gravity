"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { orbits } from "../../../../data/orbits";
import type { OrbitCategoryFilter } from "../../../../types/gallery.types";
import { useGalleryState } from "../../../providers/GalleryProvider";

// Agrupa la lógica de navegación de la galería sin modificar GalleryProvider.
export const useOrbitGallery = (active: boolean) => {
  const { state, update, toggleOrbit } = useGalleryState();

  // Muestra una tarjeta en móvil, dos en tablet y tres en escritorio.
  const [itemsPerPage, setItemsPerPage] = useState(1);

  useEffect(() => {
    const tablet = window.matchMedia("(min-width: 640px)");
    const desktop = window.matchMedia("(min-width: 1024px)");

    const updatePageSize = () => {
      setItemsPerPage(desktop.matches ? 3 : tablet.matches ? 2 : 1);
    };

    updatePageSize();
    tablet.addEventListener("change", updatePageSize);
    desktop.addEventListener("change", updatePageSize);

    return () => {
      tablet.removeEventListener("change", updatePageSize);
      desktop.removeEventListener("change", updatePageSize);
    };
  }, []);

  // Conserva el filtrado por categoría y reinicia la página al cambiarla.
  const filteredOrbits =
    state.categoryFilter === "all"
      ? orbits
      : orbits.filter((orbit) => orbit.category === state.categoryFilter);

  const changeCategory = (category: OrbitCategoryFilter) => {
    if (state.categoryFilter === category) return;

    update({
      categoryFilter: category,
      galleryPage: 0,
    });
  };

  // Calcula la paginación para la cantidad de tarjetas visibles.
  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrbits.length / itemsPerPage),
  );
  const currentPage = Math.min(state.galleryPage, totalPages - 1);
  const firstVisible = currentPage * itemsPerPage;
  const lastVisible = Math.min(
    firstVisible + itemsPerPage,
    filteredOrbits.length,
  );

  const trackTransform = `translate3d(
    calc(-${currentPage * 100}% - ${currentPage * 1.25}rem),
    0,
    0
  )`;

  const nextPage = () => {
    if (currentPage >= totalPages - 1) return;
    update({ galleryPage: currentPage + 1 });
  };

  const previousPage = () => {
    if (currentPage <= 0) return;
    update({ galleryPage: currentPage - 1 });
  };

  // Restaura el scroll guardado al volver de un detalle a la galería.
  const savedScroll = useRef(state.scroll);

  useLayoutEffect(() => {
    savedScroll.current = state.scroll;
  }, [state.scroll]);

  useLayoutEffect(() => {
    if (!active) return;

    const id = requestAnimationFrame(() => {
      window.scrollTo({
        top: savedScroll.current,
        behavior: "instant",
      });
    });

    return () => cancelAnimationFrame(id);
  }, [active]);

  // Guarda la posición justo antes de navegar al detalle de una órbita.
  const saveScroll = () => {
    update({ scroll: window.scrollY });
  };

  return {
    categoryFilter: state.categoryFilter,
    playingByOrbit: state.playingByOrbit,
    filteredOrbits,
    currentPage,
    totalPages,
    firstVisible,
    lastVisible,
    trackTransform,
    changeCategory,
    nextPage,
    previousPage,
    saveScroll,
    toggleOrbit,
  };
};
