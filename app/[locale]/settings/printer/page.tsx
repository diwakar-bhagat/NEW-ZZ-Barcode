"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import PrinterSelector from "@/components/PrinterSelector";

export default function PrinterSettingsPage() {
  const t = useTranslations("App");
  const locale = useLocale();

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-6 py-10">
      <div>
        <Link
          href={`/${locale}/app`}
          className="text-xs text-slate-500 underline-offset-2 hover:underline"
        >
          ← {t("qzBackToApp")}
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">{t("qzSettingsTitle")}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("qzSettingsHelp")}</p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <PrinterSelector />
      </div>
    </main>
  );
}
