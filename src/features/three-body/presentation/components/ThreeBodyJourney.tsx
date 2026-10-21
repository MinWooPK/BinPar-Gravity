"use client";

import { GalleryIntroduction } from "./gallery/GalleryIntroduction";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { OrbitGallery } from "./gallery/OrbitGallery";
import type { OrbitPlayback } from "../../types/animation.types";
import { useGalleryState } from "../providers/GalleryProvider";
import { getThreeBodyStage, threeBodyStages } from "../../application/journey";
import type { ThreeBodyStageId } from "../../types/journey.types";
import { ThreeBodyJourneyNavigation } from "./ThreeBodyJourneyNavigation";
import { ThreeBodyExperiment } from "./experiment/ThreeBodyExperiment";

// Gestiona la navegación entre las etapas del problema de los tres cuerpos,
// conservando el estado de la galería.
export const ThreeBodyJourney = ({
  discovery,
  animationData,
}: {
  discovery: ReactNode;
  animationData: Readonly<Record<string, OrbitPlayback>>;
}) => {
  // Obtiene las traducciones del recorrido educativo.
  const t = useTranslations("ThreeBody.journey");

  // Obtiene la función para actualizar el estado compartido de la galería.
  const { update } = useGalleryState();

  // Permite registrar una función de navegación desde el experimento.

  // Guarda la etapa activa; null representa la pantalla de bienvenida.
  const [activeStage, setActiveStage] = useState<ThreeBodyStageId | null>(null);

  // Controla la transición visual al abandonar una etapa.
  const [leaving, setLeaving] = useState(false);

  // Mantiene una referencia de la etapa que está visible.
  const activeRef = useRef<ThreeBodyStageId | null>(null);

  // Guarda la última etapa solicitada para evitar navegaciones repetidas.
  const requestedRef = useRef<ThreeBodyStageId | null>(null);

  // Recuerda la última etapa visitada para facilitar el regreso.
  const lastStage = useRef<ThreeBodyStageId>("discover");

  // Conserva la posición de desplazamiento de la etapa Descubre.
  const discoveryScroll = useRef(0);

  // Indica si debe trasladarse el foco al cambiar de etapa.
  const focusOnChange = useRef(false);

  // Guarda el temporizador utilizado para las transiciones.
  const transition = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Activa una etapa, conserva el desplazamiento anterior
  // y aplica una transición visual cuando corresponde.
  const activateStage = useCallback(
    (next: ThreeBodyStageId | null, moveFocus: boolean, animate = true) => {
      if (next === requestedRef.current) return;

      if (transition.current) clearTimeout(transition.current);

      requestedRef.current = next;

      // Obtiene la etapa que estaba visible anteriormente.
      const previous = activeRef.current;

      if (next === previous) {
        setLeaving(false);
        return;
      }

      // Guarda la posición de la galería antes de abandonarla.
      if (previous === "gallery") update({ scroll: window.scrollY });

      // Guarda la posición de desplazamiento de la etapa Descubre.
      if (previous === "discover") discoveryScroll.current = window.scrollY;

      if (previous) lastStage.current = previous;

      // Confirma el cambio de etapa y actualiza su estado.
      const commit = () => {
        transition.current = null;
        activeRef.current = next;
        focusOnChange.current = moveFocus;
        setActiveStage(next);
        setLeaving(false);
      };

      if (
        !animate ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        commit();
      else {
        setLeaving(true);
        transition.current = setTimeout(commit, 100);
      }
    },
    [update],
  );

  // Permite seleccionar una etapa y actualiza el fragmento de la URL.
  const selectStage = useCallback(
    (next: ThreeBodyStageId, focusPanel = false) => {
      if (next === requestedRef.current) return;

      window.history.pushState(window.history.state, "", `#${next}`);

      activateStage(next, focusPanel || activeRef.current === null);
    },
    [activateStage],
  );

  // Registra una función para que otros componentes puedan
  // dirigir al usuario a la etapa Experimenta.

  // Regresa a la pantalla principal del recorrido educativo.
  const returnToJourney = useCallback(() => {
    window.history.pushState(
      window.history.state,
      "",
      window.location.pathname + window.location.search,
    );

    activateStage(null, true);
  }, [activateStage]);

  // Sincroniza la etapa seleccionada con la URL
  // y con los botones Atrás y Adelante del navegador.
  useEffect(() => {
    // Identifica y activa la etapa indicada en el fragmento de la URL.
    const syncHash = (moveFocus: boolean, animate = true) =>
      activateStage(
        getThreeBodyStage(window.location.hash),
        moveFocus,
        animate,
      );

    // Sincroniza la etapa inicial después del primer renderizado.
    const frame = requestAnimationFrame(() => syncHash(false, false));

    // Actualiza la navegación cuando cambia el historial.
    const onHistoryChange = () => syncHash(true);

    window.addEventListener("hashchange", onHistoryChange);
    window.addEventListener("popstate", onHistoryChange);

    return () => {
      cancelAnimationFrame(frame);

      if (transition.current) clearTimeout(transition.current);

      window.removeEventListener("hashchange", onHistoryChange);
      window.removeEventListener("popstate", onHistoryChange);
    };
  }, [activateStage]);

  // Restaura el desplazamiento y el foco cuando cambia la etapa visible.
  useLayoutEffect(() => {
    if (activeStage !== "gallery")
      window.scrollTo({
        top: activeStage === "discover" ? discoveryScroll.current : 0,
        behavior: "instant",
      });

    if (focusOnChange.current) {
      // Identifica el elemento que debe recibir el foco.
      const target = activeStage
        ? `three-body-${activeStage}`
        : `three-body-${lastStage.current}-entry`;

      document.getElementById(target)?.focus({ preventScroll: true });

      focusOnChange.current = false;
    }
  }, [activeStage]);

  return (
    <div
      className="lab-three-body-journey-screen relative [z-index:1] flex [flex:1] flex-col w-full [max-width:80rem] min-w-0 [min-height:calc(100dvh_-_var(--site-header-height,_64px)_-_84px)] [margin-inline:auto] [padding:clamp(.5rem,_1svh,_1rem)_1rem_1rem] min-[640px]:[padding-inline:1.5rem] min-[1100px]:[padding-inline:2rem]"
      data-three-body-journey
      data-active-stage={activeStage ?? "welcome"}
    >

      <div
        className="flex [flex:1] flex-col min-w-0 [&&]:[animation:lab-three-body-journey-enter_200ms_ease-out_both] [&[data-leaving=true]]:[animation:lab-three-body-journey-exit_100ms_ease-in_both] [&[data-leaving=true]]:pointer-events-none min-[1024px]:[&[data-introduction=true]]:grid min-[1024px]:[&[data-introduction=true]]:[grid-template-columns:minmax(0,_1.6fr)_minmax(0,_1fr)] min-[1024px]:[&[data-introduction=true]]:items-center min-[1024px]:[&[data-introduction=true]]:[gap:clamp(2rem,_5vw,_5rem)] [@media_(prefers-reduced-motion:_reduce)]:[&&]:animate-none [@media_(prefers-reduced-motion:_reduce)]:[&[data-leaving=true]]:animate-none"
        data-introduction={activeStage === null}
        data-leaving={leaving}
        aria-busy={leaving}
      >
        {activeStage === null ? (
          <header className="min-w-0 [padding-block:clamp(2rem,_6vh,_5rem)] [&_h1]:m-0 [&_h1]:[color:#f8fafc] [&_h1]:[font-size:clamp(3.25rem,_6.5vw,_6rem)] [&_h1]:[font-weight:800] [&_h1]:[line-height:1.05] [&_h1]:[letter-spacing:-0.065em] [&_h1]:[overflow-wrap:anywhere]">
            <p className="[margin:0_0_clamp(1.5rem,_4vh,_3rem)] [color:#b8b0d6] [font-size:clamp(.75rem,_1.1vw,_.95rem)] font-bold [letter-spacing:.23em] uppercase">{t("eyebrow")}</p>
            <h1>{t("title")}</h1>
            <p className="[max-width:65rem] [margin:clamp(1.5rem,_4vh,_3rem)_0_0] [color:#cbd5e1] [font-size:clamp(1rem,_1.5vw,_1.25rem)] [line-height:1.7]">{t("description")}</p>
          </header>
        ) : (
          <h1 className="sr-only">{t("title")}</h1>
        )}

        <ThreeBodyJourneyNavigation
          activeStage={activeStage}
          onSelectStage={selectStage}
          onReturnToJourney={returnToJourney}
        />

        {threeBodyStages.map((stage) => (
          <section
            key={stage.id}
            id={`three-body-${stage.id}`}
            tabIndex={-1}
            aria-label={`${stage.number} — ${t(stage.title)}`}
            hidden={activeStage !== stage.id}
            className={`min-w-0 [&[hidden]]:hidden [&:not([hidden])]:flex [&:not([hidden])]:[flex:1] [&:not([hidden])]:flex-col [&:not([hidden])]:[animation:lab-three-body-journey-panel-enter_200ms_ease-out_both] [&:focus-visible]:[outline:2px_solid_#c0b3ff] [&:focus-visible]:[outline-offset:4px] [&:focus-visible]:[border-radius:8px] [@media_(prefers-reduced-motion:_reduce)]:[&:not([hidden])]:animate-none ${
              stage.id !== "discover"
                ? `lab-three-body-gallery-page [&&]:relative [&&]:[z-index:1] [&&]:[width:min(100%_-_2rem,_80rem)] [&&]:min-w-0 [&&]:[margin-inline:auto] [&&]:[padding-block:2.5rem_4rem] [&&]:[color:#f2f2fa] [&_:is(h1,_h2,_p)]:[overflow-wrap:anywhere] [&_:is(a,_button,_select,_input):focus-visible]:[outline:3px_solid_#c7baff] [&_:is(a,_button,_select,_input):focus-visible]:[outline-offset:4px] min-[640px]:[&&]:[width:min(100%_-_3rem,_80rem)] min-[640px]:[&&]:[padding-top:3.5rem] [&&&]:w-full [&&&]:m-0 [&&&]:p-0`
                : ""
            }`}
          >
            {stage.id === "discover" ? (
              discovery
            ) : stage.id === "understand" ? (
              <div className="lab-three-body-gallery-gallery min-w-0 [margin-top:0] [&_:is(h2,_p)]:[overflow-wrap:anywhere] [&_:is(a,_button,_select,_input):focus-visible]:[outline:3px_solid_#c7baff] [&_:is(a,_button,_select,_input):focus-visible]:[outline-offset:4px]">
                <GalleryIntroduction
                  onExplore={() => selectStage("gallery", true)}
                />
              </div>
            ) : stage.id === "gallery" ? (
              <OrbitGallery
                animationData={animationData}
                active={activeStage === "gallery"}
              />
            ) : (
              <ThreeBodyExperiment active={activeStage === "experiment"} />
            )}
          </section>
        ))}
      </div>
    </div>
  );
};
