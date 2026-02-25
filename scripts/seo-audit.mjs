#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const baseUrl = (process.env.SEO_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
const locales = ["es", "en"];
const privateRoutes = ["app", "login"];

const timestamp = new Date();
const reportName = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
}).format(timestamp).replace(/\s|[:]/g, "-");

const checks = [];
const failures = [];

const toAbsolute = (pathname) => `${baseUrl}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;

const toRoute = (value) => {
  const path = new URL(value, baseUrl).pathname;
  const normalized = path.replace(/\/+$/, "") || "/";
  return normalized === "" ? "/" : normalized;
};

const addCheck = (name, ok, details) => {
  const item = { name, status: ok ? "pass" : "fail" };
  if (details) {
    item.details = details;
  }

  checks.push(item);
  if (!ok) {
    failures.push(item);
  }
};

const fetchText = async (pathname) => {
  const response = await fetch(toAbsolute(pathname));
  const text = await response.text();

  return {
    ok: response.ok,
    status: response.status,
    text,
    url: response.url,
    headers: Object.fromEntries(response.headers.entries()),
  };
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const extractMeta = (html, attribute, value) => {
  const matcher = new RegExp(
    `<meta[^>]*${attribute}=["']${escapeRegExp(value)}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    "i",
  );
  return matcher.exec(html)?.[1] ?? null;
};

const extractCanonical = (html) => {
  const match = /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i.exec(html);
  return match?.[1] ?? null;
};

const hasAlternate = (html, locale) => {
  const matcher = new RegExp(
    `<link[^>]*rel=["']alternate["'][^>]*hreflang=["']${escapeRegExp(locale)}["'][^>]*href=["'][^"']+["'][^>]*>`,
    "i",
  );
  return matcher.test(html);
};

const hasJsonLd = (html, ldType) => new RegExp(`"@type"\\s*:\\s*"${ldType}"`, "i").test(html);

const parseSitemapLocs = (xmlText) =>
  [...xmlText.matchAll(/<loc>(.*?)<\/loc>/gi)]
    .map((entry) => entry[1] ?? "")
    .map(toRoute);

const checkRobots = async () => {
  const robots = await fetchText("/robots.txt");
  addCheck("robots.txt responde", robots.ok, `HTTP ${robots.status}`);
  if (!robots.ok) {
    return;
  }

  const robotsText = robots.text;
  addCheck("robots bloquea /es/login", /Disallow:\s*\/es\/login/i.test(robotsText));
  addCheck("robots bloquea /en/login", /Disallow:\s*\/en\/login/i.test(robotsText));
  addCheck("robots bloquea /es/app", /Disallow:\s*\/es\/app/i.test(robotsText));
  addCheck("robots bloquea /en/app", /Disallow:\s*\/en\/app/i.test(robotsText));
  addCheck("robots bloquea /api", /Disallow:\s*\/api/i.test(robotsText));
};

const checkPrivateNoindex = async () => {
  for (const locale of locales) {
    for (const route of privateRoutes) {
      const pathname = `/${locale}/${route}`;
      const result = await fetchText(pathname);

      addCheck(`ruta privada ${pathname} responde`, result.ok, `HTTP ${result.status}`);
      if (!result.ok) {
        continue;
      }

      const canonical = extractCanonical(result.text);
      addCheck(
        `ruta privada ${pathname} noindex presente`,
        /<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex[^"']*["']/i.test(result.text),
      );
      addCheck(
        `ruta privada ${pathname} canonical correcto`,
        canonical === toAbsolute(pathname),
        canonical ? `recibido ${canonical}` : "sin canonical",
      );
    }
  }
};

const checkSitemap = async () => {
  const sitemap = await fetchText("/sitemap.xml");
  addCheck("sitemap.xml responde", sitemap.ok, `HTTP ${sitemap.status}`);
  if (!sitemap.ok) {
    return null;
  }

  const routes = parseSitemapLocs(sitemap.text);
  const uniqueRoutes = Array.from(new Set(routes));

  addCheck("sitemap contiene URLs", uniqueRoutes.length > 0, `total ${uniqueRoutes.length}`);

  for (const locale of locales) {
    const localeRoot = `/${locale}`;
    const localeResources = `/${locale}/recursos`;
    addCheck(`sitemap incluye ${localeRoot}`, uniqueRoutes.includes(localeRoot));
    addCheck(`sitemap incluye ${localeResources}`, uniqueRoutes.includes(localeResources));
  }

  const includesPrivate = uniqueRoutes.some((route) =>
    privateRoutes.some((privateRoute) => route === `/${locales[0]}/${privateRoute}` || route === `/${locales[1]}/${privateRoute}`),
  );
  addCheck("sitemap no expone rutas privadas", !includesPrivate);

  const resourceRoutes = uniqueRoutes.filter((route) => locales.some((locale) => route.startsWith(`/${locale}/recursos/`)));
  addCheck("sitemap contiene rutas de recursos", resourceRoutes.length >= 5, `total ${resourceRoutes.length}`);

  return {
    routes: uniqueRoutes,
    resourceRoutes,
  };
};

const checkCommonMetadata = (pathname, html) => {
  const canonical = extractCanonical(html);
  addCheck(
    `${pathname} canonical correcto`,
    canonical === toAbsolute(pathname),
    canonical ? `recibido ${canonical}` : "sin canonical",
  );
  addCheck(`${pathname} alternate en español`, hasAlternate(html, "es"));
  addCheck(`${pathname} alternate en inglés`, hasAlternate(html, "en"));
  addCheck(`${pathname} alternate x-default`, hasAlternate(html, "x-default"));
  addCheck(`${pathname} tiene título`, /<title>[^<]+<\/title>/i.test(html));
  addCheck(`${pathname} tiene keywords`, !!extractMeta(html, "name", "keywords"));
  addCheck(`${pathname} tiene OG title`, !!extractMeta(html, "property", "og:title"));
  addCheck(`${pathname} tiene OG description`, !!extractMeta(html, "property", "og:description"));
  addCheck(`${pathname} tiene OG image`, !!extractMeta(html, "property", "og:image"));
  addCheck(`${pathname} tiene twitter:card`, !!extractMeta(html, "name", "twitter:card"));
};

const checkHome = async () => {
  for (const locale of locales) {
    const pathname = `/${locale}`;
    const page = await fetchText(pathname);
    addCheck(`homepage ${pathname} responde`, page.ok, `HTTP ${page.status}`);
    if (!page.ok) {
      continue;
    }

    checkCommonMetadata(pathname, page.text);
    addCheck(`${pathname} tiene H1`, /<h1[^>]*>/i.test(page.text));
    addCheck(`${pathname} tiene bloque de recursos`, /gu[ií]as|guides/i.test(page.text));
  }
};

const checkResourceIndex = async (route) => {
  const page = await fetchText(route);
  addCheck(`índice de recursos ${route} responde`, page.ok, `HTTP ${page.status}`);
  if (!page.ok) {
    return;
  }

  checkCommonMetadata(route, page.text);
  addCheck(`${route} tiene H1`, /<h1[^>]*>/i.test(page.text));
  addCheck(`${route} tiene FAQ`, /faq|preguntas frecuentes/i.test(page.text));
  addCheck(`${route} tiene JSON-LD CollectionPage`, hasJsonLd(page.text, "CollectionPage"));
  addCheck(`${route} tiene JSON-LD FAQPage`, hasJsonLd(page.text, "FAQPage"));
};

const checkResourceDetail = async (route) => {
  const page = await fetchText(route);
  addCheck(`detalle ${route} responde`, page.ok, `HTTP ${page.status}`);
  if (!page.ok) {
    return;
  }

  checkCommonMetadata(route, page.text);
  addCheck(`${route} tiene H1`, /<h1[^>]*>/i.test(page.text));
  addCheck(`${route} tiene H2`, /<h2[^>]*>/i.test(page.text));
  addCheck(`${route} tiene FAQ`, /faq|preguntas frecuentes/i.test(page.text));
  addCheck(`${route} tiene JSON-LD Article`, hasJsonLd(page.text, "Article"));
  addCheck(`${route} tiene JSON-LD BreadcrumbList`, hasJsonLd(page.text, "BreadcrumbList"));
  addCheck(`${route} tiene JSON-LD FAQPage`, hasJsonLd(page.text, "FAQPage"));
};

const run = async () => {
  const startedAt = timestamp.toISOString();

  await checkRobots();
  const sitemapData = await checkSitemap();
  await checkPrivateNoindex();
  await checkHome();

  if (sitemapData) {
    for (const route of ["/es/recursos", "/en/recursos"]) {
      await checkResourceIndex(route);
    }

    for (const route of sitemapData.resourceRoutes) {
      await checkResourceDetail(route);
    }
  }

  const summary = {
    total: checks.length,
    passed: checks.filter((item) => item.status === "pass").length,
    failed: failures.length,
  };

  const report = {
    generatedAt: startedAt,
    baseUrl,
    summary,
    routes: sitemapData?.routes ?? [],
    failures,
    checks,
  };

  mkdirSync(join(process.cwd(), "results"), { recursive: true });
  const outputPath = join(process.cwd(), "results", `seo-audit-${reportName}.json`);
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);

  for (const check of checks) {
    console.log(`${check.status === "pass" ? "✔" : "✖"} ${check.name}${check.details ? ` — ${check.details}` : ""}`);
  }

  if (failures.length > 0) {
    console.log(`\nResultado: ${failures.length} fallo(es).`);
    console.log(`Resultado guardado: ${outputPath}`);
    process.exit(1);
  }

  console.log("\nResultado: OK");
  console.log(`Resultado guardado: ${outputPath}`);
};

run().catch((error) => {
  console.error("Error ejecutando SEO Audit", error);
  process.exit(1);
});

