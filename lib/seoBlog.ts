import { locales, type Locale } from "./i18n";

type Localized<T> = {
  [key in Locale]: T;
};

type SeoBlogSection = {
  heading: Localized<string>;
  body: Localized<string[]>;
};

type SeoBlogQuestion = {
  question: Localized<string>;
  answer: Localized<string>;
};

type SeoBlogPost = {
  id: string;
  slug: Localized<string>;
  title: Localized<string>;
  metaTitle: Localized<string>;
  metaDescription: Localized<string>;
  summary: Localized<string>;
  publishedAt: string;
  tags: Localized<string>;
  intro: Localized<string>;
  sections: SeoBlogSection[];
  faqs: SeoBlogQuestion[];
};

const BLOG_POSTS: SeoBlogPost[] = [
  {
    id: "odoo-labeling-strategy",
    slug: {
      es: "estrategia-de-etiquetado-odoo",
      en: "odoo-labeling-strategy",
    },
    title: {
      es: "Estrategia de etiquetado Odoo para inventarios que escalan",
      en: "Odoo labeling strategy for scaling inventory operations",
    },
    metaTitle: {
      es: "Estrategia de etiquetado Odoo y lotes A4 para inventario",
      en: "Odoo labeling strategy and A4 batch workflows",
    },
    metaDescription: {
      es:
        "Diseña un flujo estable de impresión en Odoo para evitar desalineaciones, duplicados y errores de lote en etiquetas A4.",
      en:
        "Build a stable Odoo labeling flow to avoid misalignment, duplicates, and batch failures in A4 label printing.",
    },
    summary: {
      es:
        "Guía para planificar etiquetas por fases: catálogo, mapeo, revisión y publicación sin perder velocidad.",
      en:
        "Guide to planning label workflows in phases: catalog, mapping, verification, and rollout without losing speed.",
    },
    publishedAt: "2026-02-20",
    tags: {
      es: "Odoo, inventario, etiquetas, A4, escalabilidad",
      en: "Odoo, inventory, labels, A4, scale",
    },
    intro: {
      es:
        "Cuando crece el catálogo, la impresión de etiquetas deja de ser una acción aislada y se vuelve un sistema. Este enfoque evita errores repetitivos y reduce retrabajos.",
      en:
        "As catalogs grow, label printing stops being an isolated action and becomes a system. This approach avoids repeated mistakes and reduces rework.",
    },
    sections: [
      {
        heading: {
          es: "1) Ordena catálogo y plantillas antes de imprimir",
          en: "1) Prepare catalog and templates before printing",
        },
        body: {
          es: [
            "Empieza con una nomenclatura estable de productos y una plantilla por flujo: picking, recepción, y retail.",
            "Haz una prueba de 10 etiquetas y valida que el código de barras tenga margen interno suficiente.",
            "Si una plantilla falla, congélala y crea una variante para la siguiente familia en vez de cambiar la base.",
          ],
          en: [
            "Start with stable naming conventions and dedicated templates per flow: picking, receiving, and retail.",
            "Run a test of 10 labels and validate barcode quiet zone before running bigger batches.",
            "If a template fails, freeze it and create a variant for the next family instead of changing baseline settings.",
          ],
        },
      },
      {
        heading: {
          es: "2) Agrega control de calidad en tres puntos",
          en: "2) Add quality control in three checkpoints",
        },
        body: {
          es: [
            "Revisión de muestra tras la primera hoja de cada lote.",
            "Revisión por familia de producto para evitar mezclar códigos parecidos.",
            "Checklist semanales de margenes, contraste y texto de ubicación.",
          ],
          en: [
            "Sample check after the first sheet of each batch.",
            "Family-level spot checks to avoid mixing similar codes.",
            "Weekly checklist for margins, contrast, and location text.",
          ],
        },
      },
    ],
    faqs: [
      {
        question: {
          es: "¿Puedo usar una misma etiqueta para dos familias?",
          en: "Can I reuse one template for two families?",
        },
        answer: {
          es:
            "Sí, pero idealmente con variantes por longitud de texto y criticidad. Si los fallos suben, separa plantilla por familia.",
          en:
            "Yes, but preferably with variants for text length and criticality. If failures rise, split by product family.",
        },
      },
      {
        question: {
          es: "¿Cada cuánto debo validar la plantilla?",
          en: "How often should template validation happen?",
        },
        answer: {
          es:
            "Cada cambio de impresora o material debe ir con validación de lote corto antes de producción completa.",
          en:
            "Every printer/material change should include a short-batch validation before full-scale production.",
        },
      },
    ],
  },
  {
    id: "barcode-readability-playbook",
    slug: {
      es: "juego-de-pruebas-para-lectura-de-barras",
      en: "barcode-readability-playbook",
    },
    title: {
      es: "Juega a pasar todas las pruebas de lectura de códigos de barras",
      en: "Barcode readability playbook for production labels",
    },
    metaTitle: {
      es: "Guía práctica: pruebas de lectura de códigos en etiquetas de inventario",
      en: "Practical barcode readability testing playbook",
    },
    metaDescription: {
      es:
        "Checklist técnico para detectar dónde falla la lectura: contraste, tamaño, orientación y margen interno.",
      en:
        "Technical checklist to spot read failures: contrast, sizing, orientation and internal quiet zone.",
    },
    summary: {
      es:
        "Incluye pruebas A/B rápidas para elegir configuración sin frenar la operación diaria.",
      en:
        "Includes quick A/B checks to choose the right settings without slowing daily operations.",
    },
    publishedAt: "2026-02-10",
    tags: {
      es: "código de barras, calidad, escaneo, lector",
      en: "barcode, quality, scanning, reader",
    },
    intro: {
      es:
        "La tasa de fallos no mejora con más reintentos. Mejora configuración y prueba por bloques consistentes.",
      en:
        "Read rates don’t improve with more retries. Improve settings and test with consistent blocks.",
    },
    sections: [
      {
        heading: {
          es: "Controla primero el contraste",
          en: "Control contrast first",
        },
        body: {
          es: [
            "Compara etiquetas reales con fondo claro y fondo oscuro; el lector suele fallar más en fondos grises.",
            "Mantén texto y barras con separación suficiente entre elementos de apoyo.",
            "Reduce ruido visual: menos logotipos o elementos secundarios cerca del código.",
          ],
          en: [
            "Compare actual labels on light and dark backgrounds; scanning usually drops on mid-gray tones.",
            "Keep labels and barcodes with enough separation from secondary text.",
            "Reduce visual noise: avoid logos and extra elements near the barcode.",
          ],
        },
      },
      {
        heading: {
          es: "Valida por familia antes de escalar",
          en: "Validate per family before scaling",
        },
        body: {
          es: [
            "Agrupa por familias con códigos parecidos y prueba cada bloque con al menos 3 escaneos reales.",
            "Sube el lote solo cuando una familia alcanza estabilidad alta en pruebas.",
            "Documenta la configuración ganadora y guárdala para el siguiente trimestre.",
          ],
          en: [
            "Group by families with similar codes and test each block with at least three real scans.",
            "Scale only after one family reaches stable read results.",
            "Document the winning setup and archive it for reuse.",
          ],
        },
      },
    ],
    faqs: [
      {
        question: {
          es: "¿Qué hacer si el lector falla solo en una impresora?",
          en: "What if scans fail only on one printer?",
        },
        answer: {
          es:
            "Valida calibración y offset de esa impresora primero. Muchas veces el problema es de alimentación o bandeja.",
          en:
            "Check printer calibration and offsets first. Printer tray and feeding issues are common causes.",
        },
      },
      {
        question: {
          es: "¿Qué medir para decidir cambiar configuración?",
          en: "What to measure before changing config?",
        },
        answer: {
          es:
            "Tasa de lectura por familia, contraste percibido y porcentaje de rechazo tras 10, 50 y 200 etiquetas.",
          en:
            "Read rate per family, visible contrast, and reject rate after 10, 50 and 200 labels.",
        },
      },
    ],
  },
  {
    id: "odoo-open-source",
    slug: {
      es: "actualizaciones-etiquetas-open-source-odoo",
      en: "odoo-open-source-labeling-updates",
    },
    title: {
      es: "Actualizaciones de etiqueta para proyectos Odoo open source",
      en: "Labeling updates for open-source Odoo projects",
    },
    metaTitle: {
      es: "Actualizaciones de flujos de etiquetado en proyectos Odoo",
      en: "Labeling workflow updates in Odoo open-source projects",
    },
    metaDescription: {
      es:
        "Mantén tus integraciones de etiquetas actualizadas con enfoques seguros y trazables en proyectos Odoo MIT.",
      en:
        "Keep your label integrations up to date with safe and traceable workflows for Odoo projects.",
    },
    summary: {
      es:
        "Qué revisar trimestralmente para evitar roturas en la integración y pérdidas de precisión en etiquetas.",
      en:
        "What to review quarterly to avoid integration breakage and keep labeling accuracy stable.",
    },
    publishedAt: "2026-01-28",
    tags: {
      es: "Odoo open source, API, mantenimiento, automatización",
      en: "Odoo open source, API, maintenance, automation",
    },
    intro: {
      es:
        "Un despliegue bien mantenido reduce riesgos: cambios de versión, cambios de catálogo y credenciales controladas.",
      en:
        "A well-maintained deployment reduces risk: version changes, catalog updates, and controlled credentials.",
    },
    sections: [
      {
        heading: {
          es: "Checklist trimestral de mantenimiento",
          en: "Quarterly maintenance checklist",
        },
        body: {
          es: [
            "Revisa logs de sesión y elimina tokens antiguos en entornos de pruebas.",
            "Comprueba que la autenticación de Odoo responde con latencias normales.",
            "Confirma que los campos usados para etiquetas no han cambiado de nombre ni tipo.",
          ],
          en: [
            "Review session logs and remove stale tokens in staging environments.",
            "Check Odoo auth still responds within normal latency.",
            "Confirm label-related fields have not changed names or types.",
          ],
        },
      },
      {
        heading: {
          es: "Métricas mínimas para seguimiento",
          en: "Minimum metrics to monitor",
        },
        body: {
          es: [
            "Tasa de fallos de impresión y corrección manual por lote.",
            "Cantidad de recursos sin actualizar por semana.",
            "Tiempo de sesión y tasa de reconexión con Odoo.",
          ],
          en: [
            "Print failure rate and manual fixes per batch.",
            "Number of stale resources per week.",
            "Session length and reconnection rate with Odoo.",
          ],
        },
      },
    ],
    faqs: [
      {
        question: {
          es: "¿Es seguro trabajar con Odoo open source y Labbely?",
          en: "Is it safe to use Labbely with open-source Odoo?",
        },
        answer: {
          es:
            "Sí, siempre que controles credenciales, sesiones y acceso por roles. Las mejoras del proceso van por configuración y revisión periódica.",
          en:
            "Yes, as long as you control credentials, sessions, and role-based access. Improvements are mostly procedural and review-driven.",
        },
      },
      {
        question: {
          es: "¿Cuándo conviene actualizar la integración?",
          en: "When is it worth updating the integration?",
        },
        answer: {
          es:
            "Ante cambios de campos Odoo o problemas de rendimiento recurrentes; de lo contrario mantén la configuración estable y documentada.",
          en:
            "Whenever Odoo fields change or performance issues repeat; otherwise keep a stable, documented setup.",
        },
      },
    ],
  },
];

export type SeoBlogSummary = {
  id: string;
  slug: string;
  title: string;
  summary: string;
};

export const getAllBlogPosts = (): SeoBlogPost[] => BLOG_POSTS;

const parseTags = (tags: string) =>
  tags
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .filter((tag) => tag.length > 1);

const buildTagIntersection = (left: string, right: string) => {
  const leftTags = new Set(parseTags(left));
  const rightTags = new Set(parseTags(right));
  let score = 0;
  for (const tag of leftTags) {
    if (rightTags.has(tag)) {
      score += 1;
    }
  }
  return score;
};

export const getLocalizedBlogSummaries = (locale: Locale): SeoBlogSummary[] =>
  BLOG_POSTS.map((post) => ({
    id: post.id,
    slug: post.slug[locale],
    title: post.title[locale],
    summary: post.summary[locale],
  }));

export const getBlogByLocaleAndSlug = (
  locale: Locale,
  slug: string,
): SeoBlogPost | undefined =>
  BLOG_POSTS.find((post) => post.slug[locale] === slug);

export const getBlogByAnyLocaleSlug = (slug: string): SeoBlogPost | undefined =>
  BLOG_POSTS.find((post) =>
    (Object.values(post.slug) as string[]).some((resourceSlug) => resourceSlug === slug),
  );

export const getBlogById = (id: string): SeoBlogPost | undefined =>
  BLOG_POSTS.find((post) => post.id === id);

export const getRelatedBlogPosts = (
  locale: Locale,
  postId: string,
  fallbackSlug: string,
  limit = 2,
) => {
  const current =
    getBlogById(postId) ??
    getBlogByLocaleAndSlug(locale, fallbackSlug);
  if (!current) {
    return [];
  }

  return BLOG_POSTS.filter((post) => post.id !== postId)
    .map((post) => ({
      post,
      score: buildTagIntersection(current.tags[locale], post.tags[locale]),
      title: post.title[locale],
      slug: post.slug[locale],
      summary: post.summary[locale],
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post }) => post);
};

export const getAllBlogStaticParams = () =>
  locales.flatMap((locale) =>
    BLOG_POSTS.map((post) => ({
      locale,
      slug: post.slug[locale],
    })),
  );

export const getBlogPublishedDate = (locale: Locale, slug: string): string => {
  const post = getBlogByLocaleAndSlug(locale, slug);
  return post?.publishedAt ?? "";
};

export const getBlogKeywords = (locale: Locale, slug: string): string => {
  const post = getBlogByLocaleAndSlug(locale, slug);
  return post?.tags[locale] ?? "";
};