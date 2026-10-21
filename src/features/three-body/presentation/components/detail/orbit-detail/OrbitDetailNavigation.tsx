import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons";
import { getTranslations } from "next-intl/server";
import type { OrbitDefinition } from "../../../../types/orbit.types";

// Permite volver a la galería o visitar la siguiente solución orbital.
export const OrbitDetailNavigation = async ({
  next,
}: {
  next: OrbitDefinition;
}) => {
  const t = await getTranslations("ThreeBody");

  return (
    <nav
      className="flex items-center justify-between flex-wrap [gap:4px_20px] [margin-bottom:12px]"
      aria-label={t("detail.navigationLabel")}
    >
      <Link
        href="/three-body#gallery"
        scroll={false}
        className="[&&]:inline-flex [&&]:items-center [&&]:[gap:8px] [&&]:[min-height:44px] [&&]:[color:#d0c1ff] [&&]:[font-size:0.875rem] [&&]:[line-height:1.5] [&&]:underline [&&]:[text-underline-offset:4px] [&&]:[transition:color_160ms] [&:hover]:[color:#eee7ff] [&_svg]:[transform:rotate(180deg)] [@media_(prefers-reduced-motion:_reduce)]:[&&]:[transition:none] back-link"
      >
        <Icon name="arrow" />
        {t("backToSolutions")}
      </Link>
      <div className="flex flex-wrap items-center [gap:4px_12px] [&_a]:inline-flex [&_a]:items-center [&_a]:[gap:8px] [&_a]:[min-height:44px] [&_a]:[color:#d0c1ff] [&_a]:[font-size:0.875rem] [&_a]:[line-height:1.5] [&_a]:underline [&_a]:[text-underline-offset:4px] [&_a]:[transition:color_160ms] [&_a:hover]:[color:#eee7ff] [&_>_span]:[color:#b6bdd0] [&_>_span]:[font-size:0.8125rem] [@media_(prefers-reduced-motion:_reduce)]:[&_a]:[transition:none] next-orbit">
        <span>{t("detail.nextOrbit")}</span>
        <Link href={`/three-body/${next.slug}`}>
          {next.name} <Icon name="arrow" />
        </Link>
      </div>
    </nav>
  );
};
