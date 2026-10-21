"use client";

import { useId } from "react";
import { ThreeBodyEducation } from "./ThreeBodyEducation";
import { ThreeBodyScience } from "./ThreeBodyScience";

// Coordina las dos tarjetas educativas y comparte identificadores accesibles.
// Los diagramas son ilustrativos; las órbitas físicas se integran en la galería.
export const ThreeBodyDiscovery = () => {
  const id = useId();

  return (
    <div
      className="grid [flex:1] [grid-template-columns:repeat(2,_minmax(0,_1fr))] items-stretch [gap:clamp(20px,_2.5vw,_32px)] min-w-0 [min-height:min-content] [@media(max-width:1023px)]:[flex:none] [@media(max-width:1023px)]:[grid-template-columns:minmax(0,_1fr)] [@media(max-width:1023px)]:[gap:20px]"
      data-three-body-discovery
    >
      <ThreeBodyEducation id={id} />
      <ThreeBodyScience id={id} />
    </div>
  );
};
