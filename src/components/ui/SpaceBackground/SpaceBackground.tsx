import css from "./SpaceBackground.module.css";

const styles = {
  background: `${css["background"]} absolute [inset:0] [z-index:0] pointer-events-none [background-color:#02040a] [background-position:center] [background-size:cover] [background-repeat:no-repeat]`,
} as const;

/** Decorative static layer for a positioned hero container. */
export const SpaceBackground = () => (
  <div aria-hidden="true" className={styles.background} />
);
