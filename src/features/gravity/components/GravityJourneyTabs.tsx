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
import { gravityStages } from "./gravityJourney";
import type { GravityStageId } from "./gravityJourney";
import { GravityJourneyNavigation } from "./GravityJourneyNavigation";
import styles from "./GravityJourney.module.css";

type JourneyContextValue = {
  activeStage: GravityStageId | null;
  selectStage: (stage: GravityStageId, focusPanel?: boolean) => void;
  tutorOpen: boolean;
  closeTutor: () => void;
};
const JourneyContext = createContext<JourneyContextValue | null>(null);

const useGravityJourney = () => {
  const context = useContext(JourneyContext);
  if (!context)
    throw new Error("Gravity journey components require GravityJourney");
  return context;
};

export const useGravityJourneyTutor = () => {
  const { tutorOpen, closeTutor } = useGravityJourney();
  return { tutorOpen, closeTutor };
};

export const useActiveGravityStage = () => useGravityJourney().activeStage;

export const GravityJourney = ({
  children,
  introduction,
}: {
  children: ReactNode;
  introduction: ReactNode;
}) => {
  const [activeStage, setActiveStage] = useState<GravityStageId | null>(null);
  const [tutorOpen, setTutorOpen] = useState(false);
  const closeTutor = useCallback(() => setTutorOpen(false), []);
  const activeStageRef = useRef<GravityStageId | null>(null);
  const lastStage = useRef<GravityStageId>(gravityStages[0].id);
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollPositions = useRef<Partial<Record<GravityStageId, number>>>({});
  const focusOnChange = useRef(false);

  const activateStage = useCallback((stage: GravityStageId | null, moveFocus: boolean) => {
    const previous = activeStageRef.current;
    if (stage === previous) return;
    if (previous) {
      scrollPositions.current[previous] = viewportRef.current?.scrollTop ?? 0;
      lastStage.current = previous;
    }
    activeStageRef.current = stage;
    if (stage === null) setTutorOpen(false);
    focusOnChange.current = moveFocus;
    setActiveStage(stage);
  }, []);

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
    window.history.pushState(null, "", window.location.pathname + window.location.search);
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
    if (viewportRef.current) {
      viewportRef.current.scrollTop =
        (activeStage ? scrollPositions.current[activeStage] : 0) ?? 0;
    }
    if (focusOnChange.current) {
      const target = activeStage ?? `${lastStage.current}-entry`;
      document.getElementById(target)?.focus({ preventScroll: true });
      focusOnChange.current = false;
    }
  }, [activeStage]);

  const value = useMemo(
    () => ({ activeStage, selectStage, tutorOpen, closeTutor }),
    [activeStage, selectStage, tutorOpen, closeTutor],
  );
  return (
    <JourneyContext.Provider value={value}>
      <div
        className={styles.workspace}
        data-introduction={activeStage === null}
      >
        {activeStage === null && introduction}
        <GravityJourneyNavigation
          activeStage={activeStage}
          onSelectStage={selectStage}
          onReturnToJourney={returnToJourney}
          onOpenTutor={() => setTutorOpen(true)}
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
  stage: (typeof gravityStages)[number];
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
