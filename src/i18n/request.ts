import * as rootParams from "next/root-params";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";
import es from "../../messages/es.json";
import en from "../../messages/en.json";
import fr from "../../messages/fr.json";

const messages = { es, en, fr };

export default getRequestConfig(async () => {
  const locale = await rootParams.locale();

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return {
    locale,
    messages: messages[locale],
  };
});
