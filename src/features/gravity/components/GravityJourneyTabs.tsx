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
  activeStage: GravityStageId;
  selectStage: (stage: GravityStageId, focusPanel?: boolean) => void;
};
const JourneyContext = createContext<JourneyContextValue | null>(null);

const useGravityJourney = () => {
  const context = useContext(JourneyContext);
  if (!context) throw new Error("Gravity journey components require GravityJourney");
  return context;
};

export const GravityJourney = ({ children }: { children: ReactNode }) => {
  // A deterministic first panel keeps server markup and hydration in agreement.
  const [activeStage, setActiveStage] = useState<GravityStageId>(gravityStages[0].id);
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollPositions = useRef<Partial<Record<GravityStageId, number>>>({});
  const focusPanelOnChange = useRef(false);

  const selectStage = useCallback((stage: GravityStageId, focusPanel = false) => {
    if (stage === activeStage) {
      if (focusPanel) document.getElementById(stage)?.focus({ preventScroll: true });
      return;
    }
    scrollPositions.current[activeStage] = viewportRef.current?.scrollTop ?? 0;
    focusPanelOnChange.current = focusPanel;
    window.history.replaceState(window.history.state, "", `#${stage}`);
    setActiveStage(stage);
  }, [activeStage]);

  // Existing links/bookmarks to a learning stage still open the right panel.
  useEffect(() => {
    const syncHash = () => {
      const stage = gravityStages.find(({ id }) => id === window.location.hash.slice(1));
      if (stage) setActiveStage(stage.id);
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
      viewportRef.current.scrollTop = scrollPositions.current[activeStage] ?? 0;
    }
    if (focusPanelOnChange.current) {
      document.getElementById(activeStage)?.focus({ preventScroll: true });
      focusPanelOnChange.current = false;
    }
  }, [activeStage]);

  const value = useMemo(() => ({ activeStage, selectStage }), [activeStage, selectStage]);
  return (
    <JourneyContext.Provider value={value}>
      <div className={styles.workspace}>
        <GravityJourneyNavigation activeStage={activeStage} onSelectStage={selectStage} />
        <div ref={viewportRef} className={styles.viewport}>
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

export const GravityStageLink = ({ stageId, onClick, ...props }: StageLinkProps) => {
  const { selectStage } = useGravityJourney();
  return (
    <a
      {...props}
      href={`#${stageId}`}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        selectStage(stageId, true);
      }}
    />
  );
};
