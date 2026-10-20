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

type JourneyContextValue = {
  activeStage: GravityStageId | null;
  selectStage: (stage: GravityStageId, focusPanel?: boolean) => void;
};
const JourneyContext = createContext<JourneyContextValue | null>(null);

const useGravityJourney = () => {
  const context = useContext(JourneyContext);
  if (!context)
    throw new Error("Gravity journey components require GravityJourney");
  return context;
};

export const useActiveGravityStage = () => useGravityJourney().activeStage;

export const GravityJourney = ({
  children,
  introduction,
}: {
  children: ReactNode;
  introduction: ReactNode;
}) => {
  const t = useTranslations("Gravity");
  const [activeStage, setActiveStage] = useState<GravityStageId | null>(null);
  const activeStageRef = useRef<GravityStageId | null>(null);
  const lastStage = useRef<GravityStageId>("gravity-discovery");
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollPositions = useRef<
    Partial<Record<GravityStageId, { viewport: number; document: number }>>
  >({});
  const focusOnChange = useRef(false);

  const activateStage = useCallback(
    (stage: GravityStageId | null, moveFocus: boolean) => {
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

  const returnToJourney = useCallback(() => {
    window.history.pushState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    activateStage(null, true);
  }, [activateStage]);

  // Existing links/bookmarks to a learning stage still open the right panel.
  useEffect(() => {
    const syncHash = (moveFocus: boolean) => {
      const stage = gravityStages.find(
        ({ id }) => id === window.location.hash.slice(1),
      );
      activateStage(stage?.id ?? null, moveFocus);
    };
    const onHistoryChange = () => syncHash(true);
    const frame = requestAnimationFrame(() => syncHash(false));
    window.addEventListener("hashchange", onHistoryChange);
    window.addEventListener("popstate", onHistoryChange);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", onHistoryChange);
      window.removeEventListener("popstate", onHistoryChange);
    };
  }, [activateStage]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const position = activeStage
      ? scrollPositions.current[activeStage]
      : undefined;
    if (viewport) {
      viewport.scrollTop = position?.viewport ?? 0;
      if (getComputedStyle(viewport).overflowY === "visible") {
        window.scrollTo({ top: position?.document ?? 0, behavior: "instant" });
      }
    }
    if (focusOnChange.current) {
      const target = activeStage ?? `${lastStage.current}-entry`;
      document.getElementById(target)?.focus({ preventScroll: true });
      focusOnChange.current = false;
    }
  }, [activeStage]);

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

export const GravityJourneyPanel = ({
  stage,
  className,
  children,
}: {
  stage: GravityStage;
  className?: string;
  children: ReactNode;
}) => {
  const { activeStage } = useGravityJourney();
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

type StageLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  stageId: GravityStageId;
};

export const GravityStageLink = ({
  stageId,
  onClick,
  ...props
}: StageLinkProps) => {
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
