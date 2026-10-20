"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { gravityStages } from "../../application/gravityJourney";
import type { GravityStage, GravityStageId } from "../../types/journey.types";
import { GravityJourneyNavigation } from "./GravityJourneyNavigation";
import { gravityJourneyStyles as styles } from "./GravityJourney.styles";

// Define el estado y las funciones para navegar entre las etapas educativas.
type JourneyContextValue = {
  activeStage: GravityStageId | null;
  selectStage: (stage: GravityStageId, focusPanel?: boolean) => void;
};

// Crea el contexto para compartir la etapa activa y la navegación.
const JourneyContext = createContext<JourneyContextValue | null>(null);

// Permite acceder al contexto de navegación desde otros componentes.
export const useGravityJourney = () => {
  // Obtiene el contexto compartido del recorrido educativo.
  const context = useContext(JourneyContext);

  if (!context)
    throw new Error("Gravity journey components require GravityJourney");

  return context;
};

// Devuelve el identificador de la etapa educativa seleccionada.
export const useActiveGravityStage = () => useGravityJourney().activeStage;

// Gestiona el recorrido educativo, permitiendo cambiar de etapa,
// volver al inicio y conservar la posición de desplazamiento.
export const GravityJourney = ({
  children,
  introduction,
}: {
  children: ReactNode;
  introduction: ReactNode;
}) => {
  // Obtiene las traducciones de la sección de gravedad.
  const t = useTranslations("Gravity");

  // Guarda la etapa educativa seleccionada.
  const [activeStage, setActiveStage] = useState<GravityStageId | null>(null);

  // Mantiene una referencia actualizada de la etapa activa.
  const activeStageRef = useRef<GravityStageId | null>(null);

  // Recuerda la última etapa visitada.
  const lastStage = useRef<GravityStageId>("gravity-discovery");

  // Almacena la referencia del contenedor de las etapas.
  const viewportRef = useRef<HTMLDivElement>(null);

  // Guarda la posición de desplazamiento de cada etapa.
  const scrollPositions = useRef<
    Partial<Record<GravityStageId, { viewport: number; document: number }>>
  >({});

  // Indica si debe actualizarse el foco al cambiar de etapa.
  const focusOnChange = useRef(false);

  // Activa una etapa y conserva la posición de la anterior.
  const activateStage = useCallback(
    (stage: GravityStageId | null, moveFocus: boolean) => {
      // Obtiene la etapa que estaba activa anteriormente.
      const previous = activeStageRef.current;

      if (stage === previous) return;

      if (previous) {
        scrollPositions.current[previous] = {
          viewport: viewportRef.current?.scrollTop ?? 0,
          document: window.scrollY,
        };
        lastStage.current = previous;
      }

      activeStageRef.current = stage;
      focusOnChange.current = moveFocus;
      setActiveStage(stage);
    },
    [],
  );

  // Cambia a una etapa educativa y actualiza la URL.
  const selectStage = useCallback(
    (stage: GravityStageId, focusPanel = false) => {
      if (stage === activeStageRef.current) {
        if (focusPanel)
          document.getElementById(stage)?.focus({ preventScroll: true });

        return;
      }

      window.history.pushState(null, "", `#${stage}`);
      activateStage(stage, focusPanel || activeStageRef.current === null);
    },
    [activateStage],
  );

  // Regresa a la pantalla principal del recorrido educativo.
  const returnToJourney = useCallback(() => {
    window.history.pushState(
      null,
      "",
      window.location.pathname + window.location.search,
    );

    activateStage(null, true);
  }, [activateStage]);

  // Sincroniza la etapa activa con la URL y el historial del navegador.
  useEffect(() => {
    // Identifica la etapa correspondiente al fragmento de la URL.
    const syncHash = (moveFocus: boolean) => {
      // Busca la etapa educativa indicada en la URL.
      const stage = gravityStages.find(
        ({ id }) => id === window.location.hash.slice(1),
      );

      activateStage(stage?.id ?? null, moveFocus);
    };

    // Actualiza la etapa cuando cambia el historial del navegador.
    const onHistoryChange = () => syncHash(true);

    // Sincroniza la etapa inicial después del montaje.
    const frame = requestAnimationFrame(() => syncHash(false));

    window.addEventListener("hashchange", onHistoryChange);
    window.addEventListener("popstate", onHistoryChange);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", onHistoryChange);
      window.removeEventListener("popstate", onHistoryChange);
    };
  }, [activateStage]);

  // Restaura la posición de desplazamiento y el foco al cambiar de etapa.
  useLayoutEffect(() => {
    // Obtiene el contenedor de las etapas.
    const viewport = viewportRef.current;

    // Recupera la posición guardada de la etapa seleccionada.
    const position = activeStage
      ? scrollPositions.current[activeStage]
      : undefined;

    if (viewport) {
      viewport.scrollTop = position?.viewport ?? 0;

      if (getComputedStyle(viewport).overflowY === "visible") {
        window.scrollTo({
          top: position?.document ?? 0,
          behavior: "instant",
        });
      }
    }

    if (focusOnChange.current) {
      // Identifica el elemento que debe recibir el foco.
      const target = activeStage ?? `${lastStage.current}-entry`;

      document.getElementById(target)?.focus({ preventScroll: true });
      focusOnChange.current = false;
    }
  }, [activeStage]);

  // Comparte la etapa activa y la función de navegación mediante el contexto.
  const value = useMemo(
    () => ({ activeStage, selectStage }),
    [activeStage, selectStage],
  );

  return (
    <JourneyContext.Provider value={value}>
      <div
        className={styles.workspace}
        data-introduction={activeStage === null}
        data-active-stage={activeStage ?? undefined}
      >
        {activeStage !== null && (
          <h1 className="sr-only">
            {t("heroLead")} {t("heroSubject")}
          </h1>
        )}

        {activeStage === null && introduction}

        <GravityJourneyNavigation
          activeStage={activeStage}
          onSelectStage={selectStage}
          onReturnToJourney={returnToJourney}
        />

        <div
          ref={viewportRef}
          className={styles.viewport}
          hidden={activeStage === null}
        >
          {children}
        </div>
      </div>
    </JourneyContext.Provider>
  );
};

// Muestra el contenido de una etapa únicamente cuando está seleccionada,
// manteniendo los componentes montados para conservar su estado.
export const GravityJourneyPanel = ({
  stage,
  className,
  children,
}: {
  stage: GravityStage;
  className?: string;
  children: ReactNode;
}) => {
  // Obtiene la etapa educativa activa.
  const { activeStage } = useGravityJourney();

  // Obtiene las traducciones de los títulos de las etapas.
  const t = useTranslations("Gravity");

  return (
    <section
      id={stage.id}
      aria-label={`${stage.number} — ${t(stage.title)}`}
      tabIndex={-1}
      hidden={activeStage !== stage.id}
      className={`${styles.panel} ${className ?? ""}`}
    >
      {children}
    </section>
  );
};

// Define las propiedades de los enlaces entre etapas educativas.
type StageLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  stageId: GravityStageId;
};

// Permite navegar directamente a una etapa educativa
// mediante un enlace integrado con el recorrido.
export const GravityStageLink = ({
  stageId,
  onClick,
  ...props
}: StageLinkProps) => {
  // Obtiene la función para cambiar de etapa.
  const { selectStage } = useGravityJourney();

  return (
    <a
      {...props}
      href={`#${stageId}`}
      onClick={(event) => {
        onClick?.(event);

        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          event.altKey
        )
          return;

        event.preventDefault();
        selectStage(stageId, true);
      }}
    />
  );
};
