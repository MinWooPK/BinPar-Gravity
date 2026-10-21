"use client";

import { useTranslations } from "next-intl";

type DiscoveryTopic = "what" | "how" | "difficulty" | "history";

// Estilos compartidos por las explicaciones.
const noteClassName =
  "rounded-lg border border-[#294543] bg-[#5ee7d508] px-3 py-2.5 text-sm text-[#b8d3d2]";

const listClassName = "m-0 grid gap-3.5";

const definitionClassName = "border-l-2 border-[#746392] pl-3";

const topics = {
  what: ["two", "three"],
  how: ["attract", "combine", "evolve"],
  difficulty: ["chaos", "periodic"],
  history: ["newton", "lagrange", "poincare"],
} as const;

// Muestra la explicación del tema seleccionado.
export const DiscoveryTopicContent = ({ topic }: { topic: DiscoveryTopic }) => {
  const t = useTranslations("ThreeBody.discovery");

  if (topic === "history") {
    return (
      <>
        <h3>{t("history.title")}</h3>

        <ol
          className={`${listClassName} flex-1 content-between list-none p-0 max-[1023px]:gap-4.5`}
        >
          {topics.history.map((scientist) => (
            <li key={scientist} className={definitionClassName}>
              <h4>{t(`history.${scientist}Title`)}</h4>
              <p>{t(`history.${scientist}`)}</p>
            </li>
          ))}
        </ol>

        <p className={noteClassName}>{t("history.note")}</p>
      </>
    );
  }

  return (
    <>
      <div>
        <h3>{t(`${topic}.title`)}</h3>
        <p>{t(`${topic}.description`)}</p>
      </div>

      {topic === "how" ? (
        <ol className={`${listClassName} list-none p-0`}>
          {topics.how.map((step, index) => (
            <li key={step} className="flex items-start gap-2.5">
              <span
                className="inline-flex size-6.5 shrink-0 items-center justify-center rounded-full 
                border border-[#4a406b] bg-[#aa97ff0a] text-[0.8125rem] text-[#d9cdfa] tabular-nums"
                aria-hidden="true"
              >
                {index + 1}
              </span>

              <div>
                <h4>{t(`how.${step}Title`)}</h4>
                <p>{t(`how.${step}`)}</p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <dl className={listClassName}>
          {(topic === "what" ? topics.what : topics.difficulty).map((item) => (
            <div key={item} className={definitionClassName}>
              <dt className="mb-1.25 font-semibold text-[#dcd4f6]">
                {t(`${topic}.${item}Title`)}
              </dt>
              <dd className="m-0">
                {t(
                  topic === "what"
                    ? `what.${item}Description`
                    : `difficulty.${item}`,
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {topic === "what" ? (
        <aside className={noteClassName}>
          <h4>{t("what.noteTitle")}</h4>
          <p>{t("what.note")}</p>
        </aside>
      ) : (
        <p className={noteClassName}>{t(`${topic}.note`)}</p>
      )}
    </>
  );
};
