"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { TutorContextBridge } from "@/features/ai/presentation/providers/TutorProvider";
import { OrbitGallery } from "./gallery/OrbitGallery";
import type { OrbitPlayback } from "../../types/animation.types";
import { useGalleryState } from "../providers/GalleryProvider";
import { getThreeBodyStage, threeBodyStages } from "../../application/journey";
import type { ThreeBodyStageId } from "../../types/journey.types";
import { ThreeBodyJourneyNavigation } from "./ThreeBodyJourneyNavigation";
import { threeBodyJourneyStyles as styles } from "./ThreeBodyJourney.styles";
import { threeBodyStyles as galleryStyles } from "./gallery/ThreeBody.styles";

export const ThreeBodyJourney = ({ discovery, animationData }: {
  discovery: ReactNode;
  animationData: Readonly<Record<string, OrbitPlayback>>;
}) => {
  const t = useTranslations("ThreeBody.journey");
  const { update } = useGalleryState();
  // The server and first client render agree; hashes are read after hydration.
  const [activeStage, setActiveStage] = useState<ThreeBodyStageId | null>(null);
  const [leaving, setLeaving] = useState(false);
  const activeRef = useRef<ThreeBodyStageId | null>(null);
  const requestedRef = useRef<ThreeBodyStageId | null>(null);
  const lastStage = useRef<ThreeBodyStageId>("discover");
  const discoveryScroll = useRef(0);
  const focusOnChange = useRef(false);
  const transition = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activateStage = useCallback((next: ThreeBodyStageId | null, moveFocus: boolean, animate = true) => {
    if (next === requestedRef.current) return;
    if (transition.current) clearTimeout(transition.current);
    requestedRef.current = next;
    const previous = activeRef.current;
    if (next === previous) { setLeaving(false); return; }
    // Gallery restores its own position only when it becomes visible again.
    if (previous === "gallery") update({ scroll: window.scrollY });
    if (previous === "discover") discoveryScroll.current = window.scrollY;
    if (previous) lastStage.current = previous;
    const commit = () => {
      transition.current = null;
      activeRef.current = next;
      focusOnChange.current = moveFocus;
      setActiveStage(next);
      setLeaving(false);
    };
    if (!animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) commit();
    else { setLeaving(true); transition.current = setTimeout(commit, 100); }
  }, [update]);

  const selectStage = useCallback((next: ThreeBodyStageId, focusPanel = false) => {
    if (next === requestedRef.current) return;
    window.history.pushState(window.history.state, "", `#${next}`);
    activateStage(next, focusPanel || activeRef.current === null);
  }, [activateStage]);

  const returnToJourney = useCallback(() => {
    window.history.pushState(window.history.state, "", window.location.pathname + window.location.search);
    activateStage(null, true);
  }, [activateStage]);

  useEffect(() => {
    const syncHash = (moveFocus: boolean, animate = true) => activateStage(getThreeBodyStage(window.location.hash), moveFocus, animate);
    const frame = requestAnimationFrame(() => syncHash(false, false));
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

  useLayoutEffect(() => {
    if (activeStage !== "gallery") window.scrollTo({ top: activeStage === "discover" ? discoveryScroll.current : 0, behavior: "instant" });
    if (focusOnChange.current) {
      const target = activeStage ? `three-body-${activeStage}` : `three-body-${lastStage.current}-entry`;
      document.getElementById(target)?.focus({ preventScroll: true });
      focusOnChange.current = false;
    }
  }, [activeStage]);

  return (
    <div className={styles.screen} data-three-body-journey data-active-stage={activeStage ?? "welcome"}>
      <TutorContextBridge context={{ kind: "three-body" }} />
      <div className={styles.view} data-introduction={activeStage === null} data-leaving={leaving} aria-busy={leaving}>
        {activeStage === null ? (
          <header className={styles.hero}>
            <p className={styles.eyebrow}>{t("eyebrow")}</p>
            <h1>{t("title")}</h1>
            <p className={styles.description}>{t("description")}</p>
          </header>
        ) : <h1 className="sr-only">{t("title")}</h1>}
        <ThreeBodyJourneyNavigation activeStage={activeStage} onSelectStage={selectStage} onReturnToJourney={returnToJourney} />
        {threeBodyStages.map((stage) => (
          <section
            key={stage.id} id={`three-body-${stage.id}`} tabIndex={-1}
            aria-label={`${stage.number} — ${t(stage.title)}`} hidden={activeStage !== stage.id}
            className={`${styles.panel} ${stage.id === "gallery" ? `${galleryStyles.page} ${galleryStyles.stagePage}` : ""}`}
          >
            {stage.id === "discover" ? discovery : (
              <OrbitGallery animationData={animationData} active={activeStage === "gallery"} />
            )}
          </section>
        ))}
      </div>
    </div>
  );
};
