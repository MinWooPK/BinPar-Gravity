import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";

import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TutorProvider } from "@/features/ai/presentation/providers/TutorProvider";

import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BinPar · Gravity Lab",

  description:
    "Explora la gravedad y el problema de los tres cuerpos mediante simulaciones interactivas.",

  // Mantiene el icono en la pestaña del navegador.
  icons: {
    icon: "/gravity-lab.ico",
  },

  // Información para compartir enlaces, sin imagen.
  openGraph: {
    title: "BinPar · Gravity Lab",
    description: "Aprende física con simulaciones interactivas.",
    type: "website",
    images: [],
  },
};

export const generateStaticParams = () => {
  return routing.locales.map((locale) => ({ locale }));
};

type RootLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

const RootLayout = async ({ children, params }: RootLayoutProps) => {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh min-w-0 flex-col">
        <NextIntlClientProvider>
          <TutorProvider>
            <Header />
            <main className="min-w-0 flex-1">{children}</main>
            <Footer />
          </TutorProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default RootLayout;
