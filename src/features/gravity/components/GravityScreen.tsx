import { GravityIntroduction } from "./GravityIntroduction";
import { GravityLab } from "./GravityLab";
import { GravityParametersProvider } from "./GravityParametersProvider";

export const GravityScreen = () => (
  <div className="page-enter mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
    <GravityParametersProvider>
    <GravityIntroduction />
    <GravityLab />
    </GravityParametersProvider>
  </div>
);
