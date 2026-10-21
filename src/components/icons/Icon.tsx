import type { SVGProps } from "react";
import { Atom } from "./common/Atom";
import { Orbit } from "./common/Orbit";
import { ArrowRight } from "./common/ArrowRight";
import { Play } from "./common/Play";
import { Pause } from "./common/Pause";
import { Reset } from "./common/Reset";
import { Search } from "./common/Search";
import { Grid } from "./common/Grid";
import { List } from "./common/List";
import { ExternalLink } from "./common/ExternalLink";

const icons = {
  atom: Atom,
  orbit: Orbit,
  arrow: ArrowRight,
  play: Play,
  pause: Pause,
  reset: Reset,
  search: Search,
  grid: Grid,
  list: List,
  external: ExternalLink,
} as const;

type IconProps = SVGProps<SVGSVGElement> & { name: keyof typeof icons };

export const Icon = ({ name, ...props }: IconProps) => {
  const Component = icons[name];
  return <Component width="20" height="20" {...props} />;
};
