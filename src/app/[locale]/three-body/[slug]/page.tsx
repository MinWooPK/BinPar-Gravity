import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getOrbit, orbits } from "@/features/three-body/data/orbits";
import { OrbitDetail } from "@/features/three-body/presentation/components/detail/OrbitDetail";

export const dynamicParams = false;
export function generateStaticParams() {
  return orbits.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const orbit = getOrbit((await params).slug);
  return {
    title: orbit?.name ?? "Órbita no encontrada",
    description: orbit?.description,
  };
}
const OrbitPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const orbit = getOrbit((await params).slug);
  if (!orbit) notFound();
  return <OrbitDetail orbit={orbit} />;
};

export default OrbitPage;
