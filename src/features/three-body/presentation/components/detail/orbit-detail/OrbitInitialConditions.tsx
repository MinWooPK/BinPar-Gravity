import { getTranslations } from "next-intl/server";
import type { OrbitDefinition } from "../../../../types/orbit.types";

const coordinates = ["x", "y", "vₓ", "vᵧ"] as const;

// Muestra las condiciones iniciales y el período original publicado.
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
        className="max-w-full [margin-block:10px_8px] overflow-x-auto [border:1px_solid_#394057] [border-radius:7px] [scrollbar-color:#9687be_#111624] [&_table]:w-full [&_table]:[border-collapse:collapse] [&_table]:[color:#d5dbeb] [&_table]:[font-size:0.75rem] [&_table]:[line-height:1.5] [&_table]:tabular-nums [&_table]:[white-space:nowrap] [&_:is(th,_td)]:[padding:7px_8px] [&_:is(th,_td)]:[border-bottom:1px_solid_#2d344a] [&_:is(th,_td)]:text-right [&_thead]:[background:#1e2134] [&_thead]:[color:#e1d7ff] [&_th]:font-medium [&_tbody_tr:last-child_>_*]:[border-bottom:0] [&_tbody_th]:[color:#b7f3e7]"
        role="region"
        aria-label={t("detail.tableCaption")}
        tabIndex={0}
      >
        <table>
          <caption className="sr-only">{t("detail.tableCaption")}</caption>
          <thead>
            <tr>
              <th scope="col">{t("detail.body")}</th>
              {coordinates.map((coordinate) => (
                <th key={coordinate} scope="col">
                  {coordinate}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orbit.initial.map((body, bodyIndex) => (
              <tr key={bodyIndex}>
                <th scope="row">{bodyIndex + 1}</th>
                {body.map((value, coordinateIndex) => (
                  <td key={coordinateIndex}>
                    <data value={value}>{value.toFixed(8)}</data>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {index >= 2 && (
        <p className="[.lab-three-body-detail-tab-panel_&]:[padding-left:8px] [.lab-three-body-detail-tab-panel_&]:[border-left:2px_solid_#aa97ff80] [.lab-three-body-detail-tab-panel_&]:[font-size:0.8125rem]">
          {t("detail.refinedConditions", {
            publishedPeriod: originalPeriod.toFixed(8),
          })}
        </p>
      )}
    </div>
  );
};
