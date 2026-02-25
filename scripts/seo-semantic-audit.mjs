#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RESULTS_DIR = join(process.cwd(), "results");
const LOCALES = ["es", "en"];

const SOURCE_FILES = [
  { path: "lib/seoContent.ts", variable: "SEO_RESOURCES", kind: "resource" },
  { path: "lib/seoBlog.ts", variable: "BLOG_POSTS", kind: "blog" },
];

const STOP_WORDS = new Set([
  "el", "la", "los", "las", "un", "una", "y", "en", "de", "del", "al", "a", "que", "para", "con", "por", "como", "cuando", "cuando",
  "the", "and", "with", "from", "for", "to", "a", "an", "in", "on", "of", "that", "this", "it", "as", "at", "by",
]);

const parseCliNumber = (name, fallback) => {
  const arg = process.argv.find((entry) => entry.startsWith(`${name}=`));
  if (!arg) {
    return fallback;
  }
  const raw = arg.slice(name.length + 1);
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const extractVariableLiteral = (source, variableName) => {
  const marker = `const ${variableName}`;
  const startIndex = source.indexOf(marker);
  if (startIndex < 0) {
    throw new Error(`No se encontró ${variableName} en ${source}`);
  }

  const assignIndex = source.indexOf("=", startIndex);
  if (assignIndex < 0) {
    throw new Error(`No se encontró asignación para ${variableName}`);
  }

  let i = assignIndex + 1;
  while (i < source.length && /\s/.test(source[i])) {
    i += 1;
  }
  const opener = source[i];
  const closer = opener === "{" ? "}" : opener === "[" ? "]" : "";
  if (!closer) {
    throw new Error(`No se encontró objeto/array para ${variableName}`);
  }

  let depth = 0;
  let inString = "";
  let escaped = false;
  let literalEnd = -1;

  for (; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === inString) {
        inString = "";
      }
      continue;
    }

    if ((char === "'" || char === '"' || char === "`")) {
      inString = char;
      continue;
    }

    if (char === "/" && next === "/") {
      // Skip // comment
      while (i < source.length && source[i] !== "\n") {
        i += 1;
      }
      continue;
    }

    if (char === "/" && next === "*") {
      // Skip /* */ comment
      i += 2;
      while (i < source.length - 1 && !(source[i] === "*" && source[i + 1] === "/")) {
        i += 1;
      }
      continue;
    }

    if (char === opener) {
      depth += 1;
      continue;
    }
    if (char === closer) {
      depth -= 1;
      if (depth === 0) {
        literalEnd = i;
        break;
      }
    }
  }

  if (literalEnd < 0) {
    throw new Error(`No se encontró cierre de literal en ${variableName}`);
  }

  return source.slice(assignIndex + 1, literalEnd + 1).trim();
};

const loadItems = (filePath, variableName) => {
  const source = readFileSync(join(process.cwd(), filePath), "utf8");
  const literal = extractVariableLiteral(source, variableName);
  return new Function(`return (${literal});`)();
};

const normalizeText = (value) =>
  (value ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (value) => {
  const tokens = normalizeText(value).split(/\s+/).filter(Boolean);
  const map = new Map();
  for (const token of tokens) {
    if (STOP_WORDS.has(token) || token.length <= 2) {
      continue;
    }
    map.set(token, (map.get(token) ?? 0) + 1);
  }
  return map;
};

const cosine = (a, b) => {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const [key, valueA] of a.entries()) {
    const valueB = b.get(key) ?? 0;
    dot += valueA * valueB;
    normA += valueA * valueA;
  }

  for (const valueB of b.values()) {
    normB += valueB * valueB;
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

const combineText = (item, locale) => {
  const parts = [
    item.title?.[locale],
    item.metaTitle?.[locale],
    item.summary?.[locale],
    item.metaDescription?.[locale],
    item.description?.[locale],
    ...(Array.isArray(item.keywords?.[locale]) ? item.keywords[locale] : []),
    ...(Array.isArray(item.faqs)
      ? item.faqs.flatMap((faq) => [
          faq.question?.[locale],
          faq.answer?.[locale],
        ])
      : []),
    ...(Array.isArray(item.sections)
      ? item.sections.flatMap((section) => [
          section.heading?.[locale],
          ...(Array.isArray(section.body?.[locale]) ? section.body[locale] : []),
        ])
      : []),
  ];

  return parts
    .map((value) => value ?? "")
    .join(" ")
    .trim();
};

const evaluatePairs = (items, kind, thresholdCross, thresholdSame) => {
  const crossLocale = [];
  const duplicateWithinLocale = [];
  const vectorById = new Map();

  for (const item of items) {
    const vectors = {};
    for (const locale of LOCALES) {
      const text = combineText(item, locale);
      vectors[locale] = tokenize(text);
    }

    vectorById.set(item.id, {
      id: item.id,
      vectors,
      title: {
        es: item.title?.es ?? "",
        en: item.title?.en ?? "",
      },
      slug: {
        es: item.slug?.es ?? "",
        en: item.slug?.en ?? "",
      },
    });
  }

  for (const entry of vectorById.values()) {
    const cross = cosine(entry.vectors.es, entry.vectors.en);
    if (cross >= thresholdCross) {
      crossLocale.push({
        kind,
        id: entry.id,
        score: Number(cross.toFixed(4)),
        titles: entry.title,
        slugs: entry.slug,
      });
    }
  }

  const entries = [...vectorById.values()];
  for (let i = 0; i < entries.length - 1; i += 1) {
    for (let j = i + 1; j < entries.length; j += 1) {
      const left = entries[i];
      const right = entries[j];

      for (const locale of LOCALES) {
        const score = cosine(left.vectors[locale], right.vectors[locale]);
        if (score >= thresholdSame) {
          duplicateWithinLocale.push({
            kind,
            locale,
            pair: [left.id, right.id],
            score: Number(score.toFixed(4)),
            titles: [left.title[locale], right.title[locale]],
            slugs: [left.slug?.[locale], right.slug?.[locale]],
          });
        }
      }
    }
  }

  return {
    kind,
    crossLocale,
    duplicateWithinLocale,
    total: vectorById.size,
  };
};

const run = () => {
  const crossLocaleThreshold = parseCliNumber("--cross=", 0.6);
  const sameLocaleThreshold = parseCliNumber("--same=", 0.88);
  const output = [];
  const crossLocaleFindings = [];
  const duplicatesFindings = [];
  let totalItems = 0;

  for (const source of SOURCE_FILES) {
    let items = loadItems(source.path, source.variable);
    if (Array.isArray(items)) {
      // keep as-is
    } else if (
      source.variable === "SEO_RESOURCES" &&
      items &&
      typeof items === "object" &&
      !Array.isArray(items)
    ) {
      items = Object.values(items);
    } else {
      throw new Error(`${source.variable} no es un array válido en ${source.path}`);
    }
    const result = evaluatePairs(items, source.kind, crossLocaleThreshold, sameLocaleThreshold);
    totalItems += result.total;
    output.push(result);
    crossLocaleFindings.push(...result.crossLocale);
    duplicatesFindings.push(...result.duplicateWithinLocale);
  }

  const totalCross = crossLocaleFindings.length;
  const totalDuplicates = duplicatesFindings.length;
  const status =
    totalCross > 0 || totalDuplicates > 20
      ? "needs_review"
      : "ok";

  const report = {
    generatedAt: new Date().toISOString(),
    thresholds: {
      crossLocale: crossLocaleThreshold,
      sameLocale: sameLocaleThreshold,
    },
    totals: {
      totalItems,
      crossLocale: totalCross,
      duplicates: totalDuplicates,
    },
    status,
    crossLocale: crossLocaleFindings,
    duplicates: duplicatesFindings,
    details: output,
  };

  mkdirSync(RESULTS_DIR, { recursive: true });
  const stamp = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date()).replace(/\s|[:]/g, "-");
  const reportPath = join(RESULTS_DIR, `seo-semantic-audit-${stamp}.json`);
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

  console.log(`Reporte semántico: ${reportPath}`);
  console.log(`Estado: ${status}`);
  if (totalCross > 0) {
    console.log(`- Posible duplicación entre ES/EN: ${totalCross}`);
  }
  if (totalDuplicates > 0) {
    console.log(`- Posible duplicación interna por idioma: ${totalDuplicates}`);
  }

  if (status === "needs_review") {
    process.exitCode = 1;
  }
};

run();