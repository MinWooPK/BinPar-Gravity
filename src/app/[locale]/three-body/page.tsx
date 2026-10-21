import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ThreeBodyScreen } from "@/features/three-body/presentation/components/ThreeBodyScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ThreeBody.journey");
  return { title: t("title"), description: t("description") };
}

const Page = () => {
  return <ThreeBodyScreen />;
};

export default Page;
