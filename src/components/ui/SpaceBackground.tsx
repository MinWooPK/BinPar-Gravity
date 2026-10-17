import styles from "./SpaceBackground.module.css";

/** Decorative static layer for a positioned hero container. */
export const SpaceBackground = () => (
  <div aria-hidden="true" className={styles.background} />
);
