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
import { gravityStages } from "./gravityJourney";
import type { GravityStageId } from "./gravityJourney";
import { GravityJourneyNavigation } from "./GravityJourneyNavigation";
import styles from "./GravityJourney.module.css";

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

export const GravityJourney = ({ children, introduction }: { children: ReactNode; introduction: ReactNode }) => {
  const [activeStage, setActiveStage] = useState<GravityStageId | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollPositions = useRef<Partial<Record<GravityStageId, number>>>({});
  const focusPanelOnChange = useRef(false);

  const selectStage = useCallback(
    (stage: GravityStageId, focusPanel = false) => {
      if (stage === activeStage) {
        if (focusPanel)
          document.getElementById(stage)?.focus({ preventScroll: true });
        return;
      }
      if (activeStage) scrollPositions.current[activeStage] =
        viewportRef.current?.scrollTop ?? 0;
      focusPanelOnChange.current = focusPanel;
      window.history.replaceState(window.history.state, "", `#${stage}`);
      setActiveStage(stage);
    },
    [activeStage],
  );

  // Existing links/bookmarks to a learning stage still open the right panel.
  useEffect(() => {
    const syncHash = () => {
      const stage = gravityStages.find(
        ({ id }) => id === window.location.hash.slice(1),
      );
      setActiveStage(stage?.id ?? null);
    };
    const frame = requestAnimationFrame(syncHash);
    window.addEventListener("hashchange", syncHash);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", syncHash);
    };
  }, []);

  useLayoutEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = (activeStage ? scrollPositions.current[activeStage] : 0) ?? 0;
    }
    if (focusPanelOnChange.current && activeStage) {
      document.getElementById(activeStage)?.focus({ preventScroll: true });
      focusPanelOnChange.current = false;
    }
  }, [activeStage]);

  const value = useMemo(
    () => ({ activeStage, selectStage }),
    [activeStage, selectStage],
  );
  return (
    <JourneyContext.Provider value={value}>
      <div className={styles.workspace} data-introduction={activeStage === null}>
        {activeStage === null && introduction}
        <GravityJourneyNavigation
          activeStage={activeStage}
          onSelectStage={selectStage}
        />
        <div ref={viewportRef} className={styles.viewport} hidden={activeStage === null}>
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
  return (
    <section
      id={stage.id}
      role="tabpanel"
      aria-labelledby={`${stage.id}-tab`}
      tabIndex={0}
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
