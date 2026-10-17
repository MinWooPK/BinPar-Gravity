import { GravityEducationalCard } from "./GravityEducationalCard";
import { GravityScienceCard } from "./GravityScienceCard";
import styles from "./GravityDiscovery.module.css";

export const GravityDiscovery = () => (
  <div className={styles.layout} data-gravity-discovery>
    <GravityEducationalCard />
    <div className={styles.science}><GravityScienceCard /></div>
  </div>
);
