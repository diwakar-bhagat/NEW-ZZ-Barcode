#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const baseUrl = (process.env.SEO_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
const localeTargets = [
  "/es",
  "/en",
  "/es/recursos",
  "/en/recursos",
];

const rawTargets = process.env.LH_TARGETS ?? "";
const lighthouseTargets = rawTargets
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean)
  .map((value) => (value.startsWith("http") ? value : `${baseUrl}${value.startsWith("/") ? value : `/${value}`}`));

const targets = lighthouseTargets.length > 0 ? lighthouseTargets : localeTargets.map((value) => `${baseUrl}${value}`);

const performanceMin = Number(process.env.LH_PERFORMANCE_MIN ?? "0.75");
const seoMin = Number(process.env.LH_SEO_MIN ?? "0.90");
const outputDir = join(process.cwd(), "results");

const timestamp = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
}).format(new Date()).replace(/\s|[:]/g, "-");

const reportRows = [];
const failures = [];

const runLighthouse = (target) => {
  const safeName = target
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/-+/, "-")
    .replace(/^-|-$/g, "");
  const outputPath = join(outputDir, `lighthouse-${safeName}-${timestamp}.json`);

  const args = [
    "-y",
    "lighthouse",
    target,
    "--only-categories=performance,seo",
    "--output=json",
    `--output-path=${outputPath}`,
    "--quiet",
    "--chrome-flags=--headless=new",
    "--chrome-flags=--no-sandbox",
    "--chrome-flags=--disable-dev-shm-usage",
  ];

  const processResult = spawnSync("npx", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  const stdout = processResult.stdout ?? "";
  const stderr = processResult.stderr ?? "";
  const rawOutput = [stdout, stderr].filter(Boolean).join("\n").trim();

  if (processResult.status !== 0) {
    failures.push({ target, reason: `lighthouse exit code ${processResult.status}`, output: rawOutput.slice(0, 1_000) });
    return {
      target,
      status: "failed",
      output,
      outputPath,
    };
  }

  const payload = JSON.parse(readFileSync(outputPath, "utf8"));
  const performance = payload?.categories?.performance?.score ?? 0;
  const seo = payload?.categories?.seo?.score ?? 0;

  const performanceOk = performance >= performanceMin;
  const seoOk = seo >= seoMin;
  const status = performanceOk && seoOk ? "pass" : "warn";

  if (!performanceOk || !seoOk) {
    failures.push({
      target,
      reason: `scores below threshold (performance=${performance}, seo=${seo})`,
      output: `thresholds: performance>=${performanceMin}, seo>=${seoMin}`,
    });
  }

  return {
    target,
    status,
    report: outputPath,
    performance,
    seo,
    performanceThreshold: performanceMin,
    seoThreshold: seoMin,
  };
};

const run = async () => {
  mkdirSync(outputDir, { recursive: true });

  for (const target of targets) {
    const row = runLighthouse(target);
    reportRows.push(row);
  }

  const reportPath = join(outputDir, `lighthouse-${timestamp}.json`);
  const summary = {
    baseUrl,
    generatedAt: new Date().toISOString(),
    targets: targets.length,
    rows: reportRows,
    thresholds: {
      performance: performanceMin,
      seo: seoMin,
    },
    failures,
  };

  writeFileSync(reportPath, `${JSON.stringify(summary, null, 2)}\n`);

  console.log(`Lighthouse summary: ${reportPath}`);

  for (const row of reportRows) {
    if (!row) {
      continue;
    }

    const statusPrefix = row.status === "pass" ? "✔" : "⚠";
    const metrics = `perf=${row.performance ?? "n/a"} seo=${row.seo ?? "n/a"}`;
    console.log(`${statusPrefix} ${row.target} -> ${metrics}`);
  }

  if (failures.length > 0) {
    console.log(`${failures.length} objetivo(s) con métricas por debajo de umbral o fallo de ejecución.`);
    process.exit(1);
  }
};

run().catch((error) => {
  console.error("Error ejecutando Lighthouse Audit", error);
  process.exit(1);
});

