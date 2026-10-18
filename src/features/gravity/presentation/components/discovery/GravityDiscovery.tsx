import { GravityEducationalCard } from "./GravityEducationalCard";
import { GravityScienceCard } from "./GravityScienceCard";
import { gravityStageLayoutStyles as styles } from "../shared/GravityStageLayout.styles";

export const GravityDiscovery = () => (
  <div className={styles.layout} data-gravity-discovery>
    <GravityEducationalCard />
    <div className={styles.content}><GravityScienceCard /></div>
  </div>
);
