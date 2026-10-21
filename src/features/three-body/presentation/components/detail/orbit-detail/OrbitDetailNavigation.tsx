import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons";
import { getTranslations } from "next-intl/server";
import type { OrbitDefinition } from "../../../../types/orbit.types";

// Permite volver a la galería o visitar la siguiente órbita.
export const OrbitDetailNavigation = async ({
  next,
}: {
  next: OrbitDefinition;
}) => {
  const t = await getTranslations("ThreeBody");

  return (
    <nav
      className="mb-3 flex flex-wrap items-center justify-between gap-x-5 gap-y-1"
      aria-label={t("detail.navigationLabel")}
    >
      <Link
        href="/three-body#gallery"
        scroll={false}
        className="back-link inline-flex min-h-11 items-center gap-2 text-sm leading-normal
         text-[#d0c1ff] underline underline-offset-4 transition-colors duration-160
          hover:text-[#eee7ff] motion-reduce:transition-none"
      >
        <span className="inline-flex rotate-180">
          <Icon name="arrow" />
        </span>

        {t("backToSolutions")}
      </Link>

      <div className="next-orbit flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-[0.875rem] text-[#b6bdd0]">
          {t("detail.nextOrbit")}
        </span>

        <Link
          href={`/three-body/${next.slug}`}
          className="inline-flex min-h-11 items-center gap-2 text-sm leading-normal text-[#d0c1ff] 
          underline underline-offset-4 transition-colors duration-160 hover:text-[#eee7ff] 
          motion-reduce:transition-none"
        >
          {next.name}
          <Icon name="arrow" />
        </Link>
      </div>
    </nav>
  );
};
