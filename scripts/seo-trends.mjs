#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RESULTS_DIR = join(process.cwd(), "results");
const DEFAULT_DAYS = 30 * 12;

const parseDate = (value) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toMonthKey = (date) => new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit" }).format(date);

const safeNumber = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }
  return value;
};

const loadResults = () => {
  if (!existsSync(RESULTS_DIR)) {
    return [];
  }

  const files = readdirSync(RESULTS_DIR, { withFileTypes: true }).filter((entry) => entry.isFile());
  const reports = [];

  for (const entry of files) {
    const name = entry.name;
    if (!name.endsWith(".json")) {
      continue;
    }

    const filePath = join(RESULTS_DIR, name);
    try {
      const payload = JSON.parse(readFileSync(filePath, "utf8"));
      const generatedAt = parseDate(payload.generatedAt);
      if (!generatedAt) {
        continue;
      }
      reports.push({
        file: name,
        generatedAt,
        payload,
      });
    } catch {
      // ignore malformed result files
    }
  }

  reports.sort((a, b) => a.generatedAt.getTime() - b.generatedAt.getTime());
  return reports;
};

const filterByWindow = (reports) => {
  const args = new Set(process.argv.slice(2));
  const fromArg = [...args].find((arg) => arg.startsWith("--from="))?.slice("--from=".length);
  const toArg = [...args].find((arg) => arg.startsWith("--to="))?.slice("--to=".length);
  const daysArg = [...args].find((arg) => arg.startsWith("--days="))?.slice("--days=".length);

  const now = new Date();
  const to = parseDate(toArg ?? now.toISOString()) ?? now;
  const parsedDays = Number.parseInt(daysArg ?? "", 10);
  const from = parseDate(fromArg ?? "") ?? new Date(to.getTime() - 1000 * 60 * 60 * 24 * Math.max(parsedDays || DEFAULT_DAYS, 1));

  return reports.filter((entry) => entry.generatedAt >= from && entry.generatedAt <= to);
};

const getFailuresTop = (checkNameCounter, limit = 8) =>
  Object.entries(checkNameCounter)
    .map(([name, count]) => ({
      name,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

const isSeoAuditReport = (payload) =>
  Array.isArray(payload?.checks) && Array.isArray(payload?.failures) && typeof payload?.summary === "object";

const isLighthouseReport = (payload) => Array.isArray(payload?.rows) && typeof payload?.thresholds === "object";

const aggregateSeo = (payload, state) => {
  state.auditRuns += 1;

  if (payload?.summary && typeof payload.summary === "object") {
    state.totalChecks += payload.summary.total ?? 0;
    state.passedChecks += payload.summary.passed ?? 0;
    state.failedChecks += payload.summary.failed ?? 0;
  }

  if (Array.isArray(payload?.checks)) {
    for (const check of payload.checks) {
      if (check?.status === "fail") {
        state.failedCheckNames[check.name] = (state.failedCheckNames[check.name] ?? 0) + 1;
      }
    }
  }
};

const aggregateLighthouse = (reportRows, state) => {
  const entries = Array.isArray(reportRows?.rows) ? reportRows.rows : reportRows;
  if (!Array.isArray(entries)) {
    return;
  }

  for (const row of entries) {
    if (typeof row?.target !== "string") {
      continue;
    }

    const performance = safeNumber(row.performance);
    const seo = safeNumber(row.seo);
    state.lighthouseRuns += 1;
    state.targets.add(row.target);

    if (performance !== null) {
      state.performanceSum += performance;
      state.performanceCount += 1;
    }

    if (seo !== null) {
      state.seoSum += seo;
      state.seoCount += 1;
    }

    if (
      performance !== null &&
      seo !== null &&
      (row.status !== "pass" || (row.performanceThreshold && performance < row.performanceThreshold) || (row.seoThreshold && seo < row.seoThreshold))
    ) {
      state.lighthouseWarnings += 1;
    }
  }
};

const summarizeMonth = (monthReports) => {
  const state = {
    month: null,
    auditRuns: 0,
    lighthouseRuns: 0,
    totalChecks: 0,
    passedChecks: 0,
    failedChecks: 0,
    failedCheckNames: {},
    performanceSum: 0,
    performanceCount: 0,
    seoSum: 0,
    seoCount: 0,
    lighthouseWarnings: 0,
    targets: new Set(),
    files: [],
  };

  for (const report of monthReports) {
    const payload = report.payload;
    state.files.push({
      file: report.file,
      generatedAt: report.generatedAt.toISOString(),
      type: isSeoAuditReport(payload) ? "seo-audit" : isLighthouseReport(payload) ? "lighthouse" : "other",
    });

    if (state.month === null) {
      state.month = toMonthKey(report.generatedAt);
    }

    if (isSeoAuditReport(payload)) {
      aggregateSeo(payload, state);
    }

    if (isLighthouseReport(payload)) {
      aggregateLighthouse(payload, state);
    }
  }

  const averagePerformance = state.performanceCount > 0 ? state.performanceSum / state.performanceCount : null;
  const averageSeo = state.seoCount > 0 ? state.seoSum / state.seoCount : null;
  const passRate = state.totalChecks > 0 ? state.passedChecks / state.totalChecks : null;
  const failRate = state.totalChecks > 0 ? state.failedChecks / state.totalChecks : null;

  return {
    month: state.month,
    ranges: {
      audits: state.auditRuns,
      lighthouse: state.lighthouseRuns,
      scoredPages: state.targets.size,
    },
    checks: {
      total: state.totalChecks,
      passed: state.passedChecks,
      failed: state.failedChecks,
      passRate: passRate !== null ? Number(passRate.toFixed(3)) : null,
      failRate: failRate !== null ? Number(failRate.toFixed(3)) : null,
      topFailures: getFailuresTop(state.failedCheckNames),
    },
    lighthouse: {
      averagePerformance: averagePerformance !== null ? Number(averagePerformance.toFixed(4)) : null,
      averageSeo: averageSeo !== null ? Number(averageSeo.toFixed(4)) : null,
      warnings: state.lighthouseWarnings,
      targetCount: state.targets.size,
    },
    files: state.files,
  };
};

const generateReport = (rows) => {
  const buckets = new Map();
  for (const row of rows) {
    const month = toMonthKey(row.generatedAt);
    if (!buckets.has(month)) {
      buckets.set(month, []);
    }
    buckets.get(month)?.push(row);
  }

  const months = [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, monthReports]) => summarizeMonth(monthReports));

  const totals = {
    totalFiles: rows.length,
    months: months.length,
    firstMonth: months[0]?.month ?? null,
    lastMonth: months[months.length - 1]?.month ?? null,
  };

  return { generatedAt: new Date().toISOString(), period: totals, months };
};

const renderMarkdown = (summary) => {
  const blocks = [];
  blocks.push(`# SEO Trend Report`);
  blocks.push(`\nGenerated: ${summary.generatedAt}`);
  blocks.push(`\nPeriod: ${summary.period.months} month(s)`);
  blocks.push(`Total reports: ${summary.period.totalFiles}`);

  for (const month of summary.months) {
    blocks.push(`\n## ${month.month}`);
    blocks.push(`- Audits: ${month.ranges.audits}`);
    blocks.push(`- Lighthouse runs: ${month.ranges.lighthouse}`);
    blocks.push(`- Checks (pass/fail): ${month.checks.passed}/${month.checks.failed} of ${month.checks.total}`);
    blocks.push(`- Lighthouse score avg: performance ${month.lighthouse.averagePerformance ?? "n/a"}, SEO ${month.lighthouse.averageSeo ?? "n/a"}`);
    blocks.push(`- Warns on score thresholds: ${month.lighthouse.warnings}`);

    if (month.checks.topFailures.length > 0) {
      blocks.push(`- Top failures:`);
      for (const failure of month.checks.topFailures) {
        blocks.push(`  - ${failure.name}: ${failure.count}`);
      }
    } else {
      blocks.push(`- Sin fallos de checks significativos.`);
    }
  }

  return `${blocks.join("\n")}\n`;
};

const main = () => {
  const reports = loadResults();
  const windowedReports = filterByWindow(reports);
  const summary = generateReport(windowedReports);
  const timestamp = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date()).replace(/\s|[:]/g, "-");

  mkdirSync(RESULTS_DIR, { recursive: true });
  const output = join(RESULTS_DIR, `seo-trends-${timestamp}.json`);
  const markdown = join(RESULTS_DIR, `seo-trends-${timestamp}.md`);
  const markdownDate = renderMarkdown(summary);
  writeFileSync(output, `${JSON.stringify(summary, null, 2)}\n`);
  writeFileSync(markdown, markdownDate);

  console.log(`Resumen SEO guardado en: ${output}`);
  console.log(`Resumen markdown en: ${markdown}`);
};

main();