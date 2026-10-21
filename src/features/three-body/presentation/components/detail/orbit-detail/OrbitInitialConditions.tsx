import { MathText } from "@/components/ui/MathText";
import { getTranslations } from "next-intl/server";
import type { OrbitDefinition } from "../../../../types/orbit.types";

const coordinates = ["x", "y", "vₓ", "vᵧ"] as const;

// Muestra las condiciones iniciales y el período publicado.
export const OrbitInitialConditions = async ({
  orbit,
  index,
  originalPeriod,
}: {
  orbit: OrbitDefinition;
  index: number;
  originalPeriod: number;
}) => {
  const t = await getTranslations("ThreeBody");

  return (
    <div className="conditions" data-orbit-detail-conditions>
      <h3>{t("detail.conditionsTitle")}</h3>
      <p>{t("detail.conditionsDescription")}</p>

      <div
        className="my-2.5 mb-2 max-w-full overflow-x-auto rounded-[7px] border border-[#394057] [scrollbar-color:#9687be_#111624]"
        role="region"
        aria-label={t("detail.tableCaption")}
        tabIndex={0}
      >
        <table className="w-full border-collapse text-xs leading-normal text-[#d5dbeb] tabular-nums whitespace-nowrap">
          <caption className="sr-only">{t("detail.tableCaption")}</caption>

          <thead className="bg-[#1e2134] text-[#e1d7ff]">
            <tr>
              <th
                scope="col"
                className="border-b border-[#2d344a] px-2 py-1.75 text-right font-medium"
              >
                {t("detail.body")}
              </th>

              {coordinates.map((coordinate) => (
                <th
                  key={coordinate}
                  scope="col"
                  className="border-b border-[#2d344a] px-2 py-1.75 text-right font-medium"
                >
                  <MathText>{coordinate}</MathText>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {orbit.initial.map((body, bodyIndex) => (
              <tr key={bodyIndex} className="[&:last-child>*]:border-b-0">
                <th
                  scope="row"
                  className="border-b border-[#2d344a] px-2 py-1.75 text-right font-medium text-[#b7f3e7]"
                >
                  {bodyIndex + 1}
                </th>

                {body.map((value, coordinateIndex) => (
                  <td
                    key={coordinateIndex}
                    className="border-b border-[#2d344a] px-2 py-1.75 text-right"
                  >
                    <data value={value}>{value.toFixed(8)}</data>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {index >= 2 && (
        <p
          className="in-[.lab-three-body-detail-tab-panel]:border-l-2 in-[.lab-three-body-detail-tab-panel]:border-[#aa97ff80] 
        in-[.lab-three-body-detail-tab-panel]:pl-2 in-[.lab-three-body-detail-tab-panel]:text-[0.9375rem]"
        >
          {t("detail.refinedConditions", {
            publishedPeriod: originalPeriod.toFixed(8),
          })}
        </p>
      )}
    </div>
  );
};
