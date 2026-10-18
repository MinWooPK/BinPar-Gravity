import type { ReactNode } from "react";
import { GravityFormulaInteractionProvider } from "../understanding/GravityFormulaInteraction";
import { GravityUnderstandingSimulation } from "../understanding/GravityUnderstandingSimulation";
import { gravityStageLayoutStyles as styles } from "./GravityStageLayout.styles";

export const GravityStageLayout = ({ children }: { children: ReactNode }) => (
  <GravityFormulaInteractionProvider>
    <div className={styles.layout} data-gravity-stage-layout>
      <div className={styles.simulation}><GravityUnderstandingSimulation compact /></div>
      <div className={styles.content}>{children}</div>
    </div>
  </GravityFormulaInteractionProvider>
);
