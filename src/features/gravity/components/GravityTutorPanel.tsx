"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useGravityJourneyTutor } from "./GravityJourneyTabs";
import styles from "./GravityTutorPanel.module.css";

/** Stays mounted so closing the panel preserves replies and pending requests. */
export const GravityTutorPanel = ({ children }: { children: ReactNode }) => {
  const t = useTranslations("Gravity");
  const { tutorOpen, closeTutor } = useGravityJourneyTutor();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (tutorOpen && !dialog.open) dialog.showModal();
    if (!tutorOpen && dialog.open) dialog.close();
  }, [tutorOpen]);

  return (
    <dialog
      ref={dialogRef}
      id="gravity-tutor-dialog"
      aria-labelledby="tutor-title"
      className={styles.panel}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        closeTutor();
      }}
      onClose={() => {
        closeTutor();
        document.getElementById("gravity-tutor-trigger")?.focus({ preventScroll: true });
      }}
    >
      <div className={styles.toolbar}>
        <button type="button" onClick={closeTutor} className={styles.closeButton}>
          {t("closeTutor")} <span aria-hidden="true">×</span>
        </button>
      </div>
      {children}
    </dialog>
  );
};
