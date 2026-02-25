"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Github } from "lucide-react";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { trackPageView } from "@/lib/analytics";

export default function LoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Login");
  const tCommon = useTranslations("Common");
  const logoSrc = "/brand/labbely-logo.png";
  const [odooUrl, setOdooUrl] = useState("");
  const [db, setDb] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    trackPageView(locale, `/${locale}/login`, "view_login");
  }, [locale]);

  const handleSubmit = async () => {
    setStatus("loading");
    setMessage("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ odooUrl, db, username, password }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus("error");
      const errorCode = payload?.errorCode ?? payload?.error;
      const errorMessage =
        errorCode === "missing_credentials" || errorCode === "Missing credentials"
          ? t("errorMissingCredentials")
          : errorCode === "invalid_credentials" || errorCode === "Invalid credentials"
            ? t("errorInvalidCredentials")
            : t("loginFailed");
      setMessage(errorMessage);
      return;
    }
    setStatus("success");
    setMessage(t("sessionCreated"));
    router.push(`/${locale}/app`);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-900">
      <div className="absolute right-6 top-6 flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="https://github.com/dani-mas/labbely"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-100"
              aria-label={tCommon("github")}
            >
              <Github className="h-4 w-4" />
            </a>
          </TooltipTrigger>
          <TooltipContent>{tCommon("github")}</TooltipContent>
        </Tooltip>
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md">
            <CardHeader className="space-y-3">
          <div className="flex items-center">
            <Image
              src={logoSrc}
              alt="Labbely"
              width={220}
              height={56}
              className="h-8 w-auto"
              priority
              sizes="220px"
            />
          </div>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="odoo-url">{t("odooUrl")}</Label>
            <Input
              id="odoo-url"
              name="odooUrl"
              type="url"
              placeholder={t("odooUrlPlaceholder")}
              value={odooUrl}
              onChange={(event) => setOdooUrl(event.target.value)}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="db">{t("database")}</Label>
            <Input
              id="db"
              name="db"
              type="text"
              placeholder={t("databasePlaceholder")}
              value={db}
              onChange={(event) => setDb(event.target.value)}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="username">{t("email")}</Label>
            <Input
              id="username"
              name="username"
              type="email"
              placeholder={t("emailPlaceholder")}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={t("passwordPlaceholder")}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={status === "loading"}
          >
            {status === "loading" ? t("creatingSession") : t("createSession")}
          </Button>
          {message ? (
            <p className={`text-sm ${status === "error" ? "text-destructive" : "text-emerald-600"}`}>
              {message}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
