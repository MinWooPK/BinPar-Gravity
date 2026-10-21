import type { ReactNode } from "react";
import { TutorProvider } from "@/features/ai/presentation/providers/TutorProvider";

export default function GravityLayout({ children }: { children: ReactNode }) {
  return <TutorProvider>{children}</TutorProvider>;
}
