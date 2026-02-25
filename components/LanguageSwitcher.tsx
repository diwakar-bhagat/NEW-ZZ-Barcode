"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import Image from "next/image";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { locales, type Locale } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("Common");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isPending && typeof document !== "undefined") {
      document.body.classList.remove("locale-switching");
    }
  }, [isPending]);

  const handleLocaleChange = (nextLocale: Locale) => {
    if (nextLocale === locale) {
      return;
    }

    if (typeof document !== "undefined") {
      document.body.classList.add("locale-switching");
    }

    const actualPathname = pathname || window.location.pathname;
    const segments = actualPathname.split("/").filter(Boolean);
    const query = searchParams?.toString() ?? window.location.search.substring(1);

    const hasLocalePrefix = segments[0] && locales.includes(segments[0] as Locale);
    const pathWithoutLocale = hasLocalePrefix
      ? "/" + segments.slice(1).join("/")
      : actualPathname;

    const cleanPath = pathWithoutLocale === "/" ? "" : pathWithoutLocale;
    let newPath = `/${nextLocale}${cleanPath}`;
    if (!newPath.startsWith("/")) {
      newPath = "/" + newPath;
    }

    const fullPath = query ? `${newPath}?${query}` : newPath;
    startTransition(() => {
      router.replace(fullPath);
    });
  };

  const isActive = isPending;

  return (
    <Select value={locale} onValueChange={handleLocaleChange} disabled={isActive}>
      <SelectTrigger className="h-9 w-[140px] text-xs" disabled={isActive}>
        <div className="flex w-full items-center justify-between gap-2">
          <SelectValue placeholder={t("language")} />
          {isActive ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        </div>
      </SelectTrigger>
      <SelectContent position="popper" side="bottom" align="end" sideOffset={8} className="z-[60]">
        {locales.map((item) => (
          <SelectItem key={item} value={item}>
            {item === "en" ? t("languageEn") : t("languageEs")}
          </SelectItem>
        ))}
      </SelectContent>
      {isActive && typeof document !== "undefined"
        ? createPortal(
            <div className="locale-transition fixed inset-0 z-[1000] bg-white/95">
              <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
                <Image
                  src="/brand/labbely-icon.png"
                  alt="Labbely"
                  width={56}
                  height={56}
                  className="h-14 w-14"
                  sizes="56px"
                  priority
                />
                <div className="space-y-2">
                  <div className="mx-auto h-4 w-56 rounded-full bg-slate-200/90 animate-pulse" />
                  <div className="mx-auto h-3 w-40 rounded-full bg-slate-100 animate-pulse" />
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("loading")}</span>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </Select>
  );
}
