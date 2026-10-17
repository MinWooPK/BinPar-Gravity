import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ThreeBodyScreen } from "@/features/three-body/components/ThreeBodyScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ThreeBody.journey");
  return { title: t("title"), description: t("description") };
}

export default function Page() {
  return <ThreeBodyScreen />;
}
