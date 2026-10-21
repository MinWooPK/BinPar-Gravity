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
      className="grid flex-1 grid-cols-2 items-stretch gap-[clamp(20px,2.5vw,32px)] 
      min-w-0 min-h-min [@media(max-width:1023px)]:flex-none [@media(max-width:1023px)]:grid-cols-[minmax(0,1fr)]
       [@media(max-width:1023px)]:gap-5"
      data-three-body-discovery
    >
      <ThreeBodyEducation id={id} />
      <ThreeBodyScience id={id} />
    </div>
  );
};
