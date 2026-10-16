import type { Metadata } from "next";
import { ThreeBodyScreen } from "@/features/three-body/components/ThreeBodyScreen";

export const metadata: Metadata = { title: "El problema de los tres cuerpos" };

export default function Page() {
  return <ThreeBodyScreen />;
}
