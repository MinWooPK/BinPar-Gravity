"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import Earth3D from "./Earth3D";
import { SpaceBackground } from "@/components/ui/SpaceBackground";
import styles from "./HomeExperience.module.css";

type HomeView = "introduction" | "topics";
type HomeContextValue = {
  topicsVisible: boolean;
  showTopics: () => void;
};
const HomeContext = createContext<HomeContextValue | null>(null);

export const HomeExperience = ({
  introduction,
  topics,
}: {
  introduction: ReactNode;
  topics: ReactNode;
}) => {
  const t = useTranslations("Home");
  const [view, setView] = useState<HomeView>("introduction");
  const viewportRef = useRef<HTMLDivElement>(null);
  const topicsRef = useRef<HTMLElement>(null);
  const restoreFocus = useRef(false);

  const changeView = (next: HomeView) => {
    restoreFocus.current = true;
    const url =
      next === "topics"
        ? "#explore"
        : window.location.pathname + window.location.search;
    window.history.replaceState(window.history.state, "", url);
    setView(next);
  };

  useEffect(() => {
    const syncHash = () =>
      setView(window.location.hash === "#explore" ? "topics" : "introduction");
    const frame = requestAnimationFrame(syncHash);
    window.addEventListener("hashchange", syncHash);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", syncHash);
    };
  }, []);

  useLayoutEffect(() => {
    if (viewportRef.current) viewportRef.current.scrollTop = 0;
    if (restoreFocus.current) {
      const target =
        view === "topics"
          ? topicsRef.current
          : viewportRef.current?.querySelector<HTMLButtonElement>(
              "[data-home-explore]",
            );
      target?.focus({ preventScroll: true });
      restoreFocus.current = false;
    }
  }, [view]);

  return (
    <HomeContext.Provider
      value={{
        topicsVisible: view === "topics",
        showTopics: () => changeView("topics"),
      }}
    >
      <div
        className={styles.screen}
        onKeyDown={(event) => {
          if (
            event.key === "Escape" &&
            !event.defaultPrevented &&
            view === "topics"
          ) {
            event.preventDefault();
            changeView("introduction");
          }
        }}
      >
        <div className={styles.scenery}>
          <SpaceBackground />
          {/* This layer stays mounted across views, preserving the scene and rotation. */}
          <div className={styles.earth}>
            <Earth3D />
          </div>
        </div>
        <div ref={viewportRef} className={styles.viewport}>
          <div
            hidden={view !== "introduction"}
            className={`${styles.panel} ${styles.introduction}`}
          >
            {introduction}
          </div>
          <section
            ref={topicsRef}
            id="explore"
            aria-labelledby="explore-title"
            tabIndex={-1}
            hidden={view !== "topics"}
            className={`${styles.panel} ${styles.topics}`}
          >
            <div className={styles.topicsHeader}>
              <button
                type="button"
                aria-label={t("backToHome")}
                onClick={() => changeView("introduction")}
                className={styles.backButton}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles.backIcon}
                >
                  <path d="M19 12H5m7-7-7 7 7 7" />
                </svg>
              </button>
              <h2 id="explore-title" className={styles.topicsTitle}>
                {t("exploreEyebrow")}
              </h2>
            </div>
            {topics}
          </section>
        </div>
      </div>
    </HomeContext.Provider>
  );
};

export const HomeExploreButton = ({ className }: { className: string }) => {
  const t = useTranslations("Home");
  const context = useContext(HomeContext);
  if (!context) throw new Error("HomeExploreButton requires HomeExperience");
  return (
    <button
      data-home-explore
      type="button"
      aria-controls="explore"
      aria-expanded={context.topicsVisible}
      onClick={context.showTopics}
      className={className}
    >
      {t("explore")}
    </button>
  );
};
