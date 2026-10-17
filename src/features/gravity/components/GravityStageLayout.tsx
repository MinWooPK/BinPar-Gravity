import type { ReactNode } from "react";
import { GravityFormulaInteractionProvider } from "./GravityFormulaInteraction";
import { GravityUnderstandingSimulation } from "./GravityUnderstandingSimulation";
import styles from "./GravityStageLayout.module.css";

export const GravityStageLayout = ({ children }: { children: ReactNode }) => (
  <GravityFormulaInteractionProvider>
    <div className={styles.layout} data-gravity-stage-layout>
      <div className={styles.simulation}><GravityUnderstandingSimulation compact /></div>
      <div className={styles.content}>{children}</div>
    </div>
  </GravityFormulaInteractionProvider>
);
