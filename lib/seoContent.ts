
export const SEO_RESOURCE_LOCALE_DEFAULT = "es" as const;

import { locales, type Locale } from "./i18n";

export type Localized<T> = {
  [key in Locale]: T;
};

type SeoSection = {
  heading: Localized<string>;
  body: Localized<string[]>;
};

type SeoFaq = {
  question: Localized<string>;
  answer: Localized<string>;
};

export type SeoResource = {
  id: string;
  slug: Localized<string>;
  title: Localized<string>;
  metaTitle: Localized<string>;
  metaDescription: Localized<string>;
  summary: Localized<string>;
  sections: SeoSection[];
  faqs: SeoFaq[];
  keywords: Localized<string>;
  relatedIds: string[];
};

const SEO_RESOURCES: Record<string, SeoResource> = {
  "barcode-label-generator": {
    id: "barcode-label-generator",
    slug: {
      es: "etiquetas-codigo-barras",
      en: "barcode-label-generator",
    },
    title: {
      es: "Generador de etiquetas de código de barras online",
      en: "Online barcode label generator",
    },
    metaTitle: {
      es: "Generador de etiquetas de código de barras online | Labbely",
      en: "Online barcode label generator | Labbely",
    },
    metaDescription: {
      es:
        "Guía práctica para generar etiquetas de código de barras rápidas y listosas para imprimir en hojas A4 con Labbely, ideal para tiendas, almacenes y equipos de inventario.",
      en:
        "Practical guide to generate printable barcode labels on A4 sheets with Labbely. Fast workflows for shop, inventory, and logistics teams.",
    },
    summary: {
      es:
        "Aprende a crear etiquetas de producto con códigos de barras listas para imprimir y optimizadas para tu impresora A4 estándar.",
      en:
        "Learn how to build product labels with barcodes ready for print, using standard A4 printers and repeatable layout presets.",
    },
    sections: [
      {
        heading: {
          es: "Cómo preparar etiquetas en menos de 10 minutos",
          en: "How to prepare labels in under 10 minutes",
        },
        body: {
          es: [
            "Empieza por definir el formato de tu etiqueta y el tipo de código de barras. En Labbely puedes combinar 4x13, 3x8 y 2x7 por hoja A4 según tu impresora.",
            "Añade productos desde Odoo o manualmente, asigna uno por etiqueta y revisa la vista previa antes de imprimir. Así evitas repeticiones o desalineaciones.",
            "Cuando confirmes el resultado, lanza la impresión y revisa el primer pliego en papel barato antes de correr todo el lote.",
          ],
          en: [
            "Start by selecting label geometry and barcode format. Labbely supports 4x13, 3x8 and 2x7 layouts per A4 sheet.",
            "Add products from Odoo or manual mode, fill the grid quickly, and validate the preview before printing to keep quality high.",
            "When everything aligns, print one test sheet first, then generate the full batch once spacing and margins are correct.",
          ],
        },
      },
      {
        heading: {
          es: "Mejorar la legibilidad del código de barras",
          en: "Improve barcode legibility",
        },
        body: {
          es: [
            "Usa contraste alto entre texto y etiqueta, evita fondos recargados y confirma que el tamaño del código cumpla con el margen interno.",
            "Si una impresora muestra barras finas, sube ligeramente la altura del código y el espacio lateral dentro de la celda.",
            "Activa modo de prueba visual y limpia el cabezal de impresora si la lectura falla en lectores antiguos.",
          ],
          en: [
            "Use high contrast between text and label background, avoid complex backgrounds, and keep adequate quiet zones around each barcode.",
            "If your printer renders lines too thin, increase barcode height and internal label padding by small steps.",
            "Run a visual test pass first; if scanners fail, clean printer rollers and retest with one row at a time.",
          ],
        },
      },
      {
        heading: {
          es: "Errores comunes y cómo evitarlos",
          en: "Common mistakes and how to avoid them",
        },
        body: {
          es: [
            "Usar el tamaño equivocado del papel provoca etiquetas corridas. Verifica siempre que el documento salga en A4 y no en Letter.",
            "Los márgenes predeterminados no son universales. Ajusta offset y separaciones por impresora para evitar que se salgan bordes.",
            "Copia de barras duplicadas suele venir de productos repetidos. Mantén un control visual de referencias y elimina duplicados antes de imprimir.",
          ],
          en: [
            "Selecting the wrong paper size causes layout drift. Confirm the export paper remains A4, not Letter.",
            "Margins vary per printer. Tune offsets and gaps per device before mass printing.",
            "Duplicate barcodes often come from repeated products in the list; review and de-duplicate before generating a full run.",
          ],
        },
      },
    ],
    faqs: [
      {
        question: {
          es: "¿Puedo imprimir etiquetas sin Odoo?",
          en: "Can I print labels without Odoo?",
        },
        answer: {
          es:
            "Sí. Puedes introducir productos manualmente y crear todas las etiquetas. La integración con Odoo es opcional para quienes sincronizan catálogos grandes.",
          en:
            "Yes. You can add products manually and create all labels. Odoo integration is optional for teams that want bulk product sync.",
        },
      },
      {
        question: {
          es: "¿Las etiquetas son compatibles con lectores de código de barras comunes?",
          en: "Are labels compatible with common barcode scanners?",
        },
        answer: {
          es:
            "En la mayoría de casos sí. Si tienes problemas, revisa contraste, tamaño de celda y el margen de lectura del código.",
          en:
            "In most cases yes. If scanners fail, verify barcode contrast, cell size and quiet zone spacing.",
        },
      },
      {
        question: {
          es: "¿Hay límite de etiquetas por exportación?",
          en: "Is there any label export limit?",
        },
        answer: {
          es:
            "Labbely funciona en navegador y no impone límites rígidos por sesión. La velocidad depende de tu navegador y memoria.",
          en:
            "Labbely runs entirely in the browser and does not impose a hard session label cap. Speed depends on browser and device capacity.",
        },
      },
    ],
    keywords: {
      es: "generador de etiquetas codigo de barras, etiquetas online, imprimir etiquetas a4, etiquetas de productos",
      en: "barcode label generator, print barcode labels, barcode printer-friendly labels, product labels A4",
    },
    relatedIds: [
      "a4-label-templates",
      "inventory-labeling",
    ],
  },
  "a4-label-templates": {
    id: "a4-label-templates",
    slug: {
      es: "etiquetas-a4-para-inventario",
      en: "a4-inventory-label-templates",
    },
    title: {
      es: "Plantillas de etiquetas A4 para inventario",
      en: "A4 label templates for inventory",
    },
    metaTitle: {
      es: "Plantillas de etiquetas A4 imprimibles | Labbely",
      en: "Printable A4 label templates | Labbely",
    },
    metaDescription: {
      es:
        "Configura plantillas 4x13, 3x8 y 2x7 para hojas A4. Descubre cómo preparar lotes y ajustar márgenes para una impresión constante.",
      en:
        "Set up 4x13, 3x8 and 2x7 templates on A4 sheets. Learn batch setup and margin tuning for consistent printing.",
    },
    summary: {
      es:
        "Plantillas optimizadas para impresoras de oficina en A4 y operación diaria de inventario.",
      en:
        "Office-printer friendly templates for everyday inventory operations.",
    },
    sections: [
      {
        heading: {
          es: "A4 4x13: máxima densidad para surtido",
          en: "A4 4x13: high density for SKU-heavy stock",
        },
        body: {
          es: [
            "Usa 4x13 cuando manejas gran cantidad de referencias y buscas sacar el máximo de cada hoja.",
            "En esta configuración el código ocupa más espacio proporcional; evita nombres excesivamente largos para mantener limpieza visual.",
            "Es ideal para bultos chicos, accesorios o artículos de alto volumen con nomenclatura corta.",
          ],
          en: [
            "Use 4x13 when you handle a high volume of SKUs and need maximum density per sheet.",
            "This preset compresses text width, so keep names short to preserve scanning quality and avoid wrapping.",
            "It is ideal for small products, accessories, or high-throughput picking operations.",
          ],
        },
      },
      {
        heading: {
          es: "A4 3x8: equilibrio entre tamaño y legibilidad",
          en: "A4 3x8: balance between size and readability",
        },
        body: {
          es: [
            "3x8 mejora la legibilidad manteniendo buen aprovechamiento del papel.",
            "Es una opción recomendada para productos que requieren nombre y código de barras visibles con mayor claridad.",
            "Configura esta plantilla para pasillos de reposición y rotación semanal media/alta.",
          ],
          en: [
            "3x8 gives a better readability ratio while keeping good paper utilization.",
            "Choose this layout when labels need clearer product name and barcode visibility.",
            "It works well for replenishment lines and moderate-high item rotation.",
          ],
        },
      },
      {
        heading: {
          es: "A4 2x7: etiquetas grandes para logística y recepción",
          en: "A4 2x7: large labels for logistics and receiving",
        },
        body: {
          es: [
            "Prioriza esta plantilla si necesitas códigos largos, referencias internas y texto adicional de recepción.",
            "Es útil para palets, bultos y entornos donde se requiere lectura rápida a distancia.",
            "Combínala con un tamaño de fuente superior y prueba márgenes más amplios para que nada quede recortado.",
          ],
          en: [
            "Choose this layout when labels need long reference text, extra notes, and easier scanning at distance.",
            "Great for pallets, bins, and receiving stations.",
            "Increase base font size and print margins to avoid accidental clipping.",
          ],
        },
      },
    ],
    faqs: [
      {
        question: {
          es: "¿Qué plantilla debo elegir para mi impresora de oficina?",
          en: "Which template should I pick for office printers?",
        },
        answer: {
          es:
            "Empieza con 3x8 y valida un lote pequeño. Si no hay rechazo en escaneo, ajusta a 4x13 para más rendimiento o 2x7 para etiquetas grandes.",
          en:
            "Start with 3x8 and validate a test run. If scans are reliable, move to 4x13 for throughput or 2x7 for larger labels.",
        },
      },
      {
        question: {
          es: "¿Puedo reutilizar una plantilla para otro tamaño de papel?",
          en: "Can I reuse a template on a different paper size?",
        },
        answer: {
          es:
            "No de forma ideal. Ajusta manualmente medidas y pruebas porque A4 y Letter cambian escala y separación.",
          en:
            "Not without recalibration. A4 and Letter use different printable areas and spacing behavior.",
        },
      },
      {
        question: {
          es: "¿Hay límite de etiquetas por plantilla?",
          en: "Is there a limit per template?",
        },
        answer: {
          es:
            "La plantilla define cantidad por hoja. Puedes generar muchas hojas si el inventario crece, sin tocar el layout base.",
          en:
            "The template sets labels per sheet. You can generate multiple pages without changing the base preset.",
        },
      },
    ],
    keywords: {
      es: "plantillas etiquetas a4, etiqueta inventario, plantilla 4x13 3x8 2x7",
      en: "A4 label templates, inventory labels, 4x13 3x8 2x7 labels",
    },
    relatedIds: ["barcode-label-generator", "inventory-labeling"],
  },
  "odoo-17-integration": {
    id: "odoo-17-integration",
    slug: {
      es: "integracion-odoo-17",
      en: "odoo-17-integration",
    },
    title: {
      es: "Integración de Labbely con Odoo 17",
      en: "Labbely integration with Odoo 17",
    },
    metaTitle: {
      es: "Integración Odoo 17 para etiquetas | Labbely",
      en: "Odoo 17 integration for labels | Labbely",
    },
    metaDescription: {
      es:
        "Conecta Odoo 17 en minutos y genera etiquetas con nombre, código de barras y referencias desde tu catálogo sin duplicar datos.",
      en:
        "Connect Odoo 17 quickly and generate labels with product name, barcode and reference data directly from your catalog.",
    },
    summary: {
      es: "Sincronización directa con Odoo 17 para mantener inventario y etiquetas alineadas cada día.",
      en: "Direct Odoo 17 sync to keep inventory and labels aligned every day.",
    },
    sections: [
      {
        heading: {
          es: "Configura el conector correctamente",
          en: "Set up the connector correctly",
        },
        body: {
          es: [
            "Usa una URL de Odoo válida, base de datos y credenciales con acceso de lectura al catálogo de productos.",
            "Haz login en Labbely una vez por sesión de trabajo para evitar autenticación repetida y mantener privacidad.",
            "Verifica que el estado quede en conectado antes de editar etiquetas, así trabajas sobre datos actuales.",
          ],
          en: [
            "Use a valid Odoo URL, database and credentials with read access to the product catalog.",
            "Sign in once per work session to avoid repeated authentication and keep credentials private.",
            "Check connection status first and only then start editing labels from live product data.",
          ],
        },
      },
      {
        heading: {
          es: "Flujo recomendado de sincronización",
          en: "Recommended sync flow",
        },
        body: {
          es: [
            "Busca productos por nombre, código de barras o SKU y agrega solo los que imprimirás.",
            "Asigna y revisa lote de etiquetas para no mezclar familias con códigos idénticos o similares.",
            "Antes de imprimir, limpia búsquedas antiguas y confirma stock mínimo en tu inventario.",
          ],
          en: [
            "Search products by name, barcode, or SKU and add only what you plan to print.",
            "Assign and preview labels by group to avoid mixing close SKUs.",
            "Before printing, clear stale search data and verify the current product set in your workflow.",
          ],
        },
      },
      {
        heading: {
          es: "Seguridad y mantenimiento",
          en: "Security and maintenance",
        },
        body: {
          es: [
            "La sesión se guarda en backend interno del servidor y está pensada para un entorno controlado.",
            "Si subes el proyecto, refuerza secretos y autenticación según tu política interna.",
            "Monitorea intentos de acceso y cambios de credenciales en Odoo para evitar bloqueos.",
          ],
          en: [
            "Session state is stored in the app server and should run in a controlled environment.",
            "If you self-host, enforce secrets and access policies aligned with your internal security model.",
            "Track access attempts and credential changes in Odoo to prevent integration lockouts.",
          ],
        },
      },
    ],
    faqs: [
      {
        question: {
          es: "¿Necesito conocimientos técnicos para conectar Odoo?",
          en: "Do I need technical knowledge to connect Odoo?",
        },
        answer: {
          es:
            "No. El proceso es guiado y solo requiere una cuenta válida de Odoo con permisos de lectura de producto.",
          en: "No. The setup is guided and requires a valid Odoo account with read permissions on products.",
        },
      },
      {
        question: {
          es: "¿Cuánto tarda en actualizarse la información?",
          en: "How often does data refresh?",
        },
        answer: {
          es:
            "La búsqueda se hace en vivo al introducir términos, así obtienes resultados actualizados del momento.",
          en:
            "Search queries are executed live, so you get up-to-date results from the current catalog state.",
        },
      },
      {
        question: {
          es: "¿Puedo desactivar la integración luego de probarla?",
          en: "Can I disable integration after setup?",
        },
        answer: {
          es:
            "Sí. Puedes volver al modo manual en cualquier momento desde la pantalla de app sin reinstalar la herramienta.",
          en: "Yes. You can switch to manual mode from the app screen at any time without reinstalling anything.",
        },
      },
    ],
    keywords: {
      es: "integración odoo 17, etiquetas odoo, sync productos odoo",
      en: "Odoo 17 integration, labels from Odoo, Odoo product sync",
    },
    relatedIds: ["barcode-label-generator", "retail-labeling"],
  },
  "inventory-labeling": {
    id: "inventory-labeling",
    slug: {
      es: "etiquetado-de-inventario",
      en: "inventory-labeling-guide",
    },
    title: {
      es: "Etiquetado de inventario para almacenes",
      en: "Inventory labeling guide",
    },
    metaTitle: {
      es: "Guía de etiquetado de inventario para almacenes | Labbely",
      en: "Inventory labeling guide for warehouses | Labbely",
    },
    metaDescription: {
      es:
        "Diseña un proceso de etiquetado de inventario ágil: alta de referencias, asignación por ubicación y ciclos de reposición con Labbely.",
      en:
        "Build a fast inventory labeling process with batch assignment, location mapping, and replenishment cycles.",
    },
    summary: {
      es: "Modelo de etiquetado por áreas para controlar stock entrante, ubicación y trazabilidad interna.",
      en: "Zone-based labeling process for incoming stock, location control, and internal traceability.",
    },
    sections: [
      {
        heading: {
          es: "Control por ubicación",
          en: "Location-based control",
        },
        body: {
          es: [
            "Asigna códigos y referencias por zona: estantería, pasillo y nivel. Esto acelera la revisión de stock y reduce errores de picking.",
            "Si reutilizas la misma referencia en varias ubicaciones, crea líneas separadas con código interno distinto para evitar confusión.",
            "Usa un prefijo visible para lotes o bloques de recepción.",
          ],
          en: [
            "Assign products per location: aisle, rack and level, which speeds stock checks and reduces picking mistakes.",
            "If the same item appears in multiple locations, keep separate internal notes or references per instance.",
            "Use clear prefixes for batches or receiving runs.",
          ],
        },
      },
      {
        heading: {
          es: "Ciclo de recepción y salida",
          en: "Receiving and outgoing cycle",
        },
        body: {
          es: [
            "Define una etiqueta de recepción con fecha/código de lote para inspección inicial.",
            "Reemplaza físicamente las etiquetas dañadas y genera una lista de revisión al final de turno.",
            "Mantén consistencia en fuente y tamaño de nombre para facilitar auditoría visual sin impresora.",
          ],
          en: [
            "Add receiving labels with date or lot codes for first-line inspection.",
            "Replace damaged labels promptly and produce a short daily verification checklist.",
            "Keep font and name size consistent to simplify visual audits without printing aids.",
          ],
        },
      },
      {
        heading: {
          es: "Checklist semanal de calidad",
          en: "Weekly quality checklist",
        },
        body: {
          es: [
            "Verifica 10% del inventario etiquetado con escaneo random para detectar etiquetas mal alineadas.",
            "Revisa lectores y papel disponible antes de picos de carga para no bloquear producción.",
            "Ajusta separaciones internas si aparece doblete de corte en más de 3 etiquetas por hoja.",
          ],
          en: [
            "Randomly check 10% of labeled stock to catch alignment and print issues early.",
            "Inspect scanners and paper stock before demand spikes so production is not delayed.",
            "Adjust inner spacing when repeated clipping appears in 3+ labels per sheet.",
          ],
        },
      },
    ],
    faqs: [
      {
        question: {
          es: "¿Puedo usar Labbely para auditoría de inventario física?",
          en: "Can I use Labbely for physical inventory audits?",
        },
        answer: {
          es:
            "Sí, especialmente para operaciones pequeñas y medianas donde se necesita rotulación repetible y trazabilidad ligera.",
          en: "Yes, especially in small and medium operations that need repeatable labeling and lightweight traceability.",
        },
      },
      {
        question: {
          es: "¿Cómo evitar etiquetas dañadas en transporte interno?",
          en: "How to avoid label damage during internal transport?",
        },
        answer: {
          es:
            "Usa papel satinado o recubrimiento mate según el material y coloca un respaldo protector para piezas con fricción alta.",
          en:
            "Use matte or protected finish depending on paper and add protective over-labels for high-friction points.",
        },
      },
      {
        question: {
          es: "¿Conviene cambiar la plantilla por mes o por proyecto?",
          en: "Should template change by month or by project?",
        },
        answer: {
          es:
            "No es necesario por mes. Ajusta la plantilla cuando cambian tus tamaños de empaque o la unidad de conteo.",
          en:
            "Not by month. Change template only when package size or counting unit requirements change.",
        },
      },
    ],
    keywords: {
      es: "etiquetado inventario, control de stock, almacen, ubicaciones",
      en: "inventory labeling, stock control, warehouse labels, location labeling",
    },
    relatedIds: ["a4-label-templates", "retail-labeling"],
  },
  "retail-labeling": {
    id: "retail-labeling",
    slug: {
      es: "etiquetas-para-retail",
      en: "retail-label-templates",
    },
    title: {
      es: "Etiquetas para retail y punto de venta",
      en: "Retail label templates",
    },
    metaTitle: {
      es: "Etiquetas para retail y punto de venta | Labbely",
      en: "Retail and POS label templates | Labbely",
    },
    metaDescription: {
      es:
        "Plantillas y buenas prácticas para etiquetado en tiendas físicas y comercio electrónico: precios, SKU, variantes y códigos de barras en un mismo flujo.",
      en:
        "Templates and practical tips for retail labels: price, SKU and barcode at shelf and e-commerce workflows in one place.",
    },
    summary: {
      es: "Guía para reducir errores en mostrador y mejorar reposición con etiquetado rápido y consistente.",
      en: "Guide to reduce POS errors and improve replenishment with fast, consistent label workflows.",
    },
    sections: [
      {
        heading: {
          es: "Etiquetas con precio y referencia",
          en: "Price and reference labels",
        },
        body: {
          es: [
            "Incluye solo campos críticos: nombre corto, código, precio, y referencia interna.",
            "En retail, la velocidad importa. Limita texto y usa tamaño de fuente estable para lectura rápida desde varias líneas.",
            "Etiqueta por lote de productos con el mismo formato de precio para evitar confusiones de caja.",
          ],
          en: [
            "Include only essential fields: short name, code, price and internal reference.",
            "In retail speed matters; keep short text and consistent font size for quick customer-facing reading.",
            "Print in consistent batches to reduce manual rework at POS and storage points.",
          ],
        },
      },
      {
        heading: {
          es: "Punto de venta y reposición", 
          en: "POS and replenishment",
        },
        body: {
          es: [
            "Haz una plantilla por familia de productos para que la reposición sea homogénea.",
            "Añade un indicador de tamaño o color por línea de surtido para detectar rápido cambios de surtido en estantería.",
            "Conserva una copia digital por semana de etiquetas emitidas para trazabilidad interna y conciliación.",
          ],
          en: [
            "Create one template per product family so replenishment remains consistent.",
            "Add subtle color or size markers to quickly identify merchandising changes on shelf.",
            "Keep a weekly backup of printed labels for traceability and reconciliation.",
          ],
        },
      },
      {
        heading: {
          es: "Errores frecuentes en retail",
          en: "Frequent retail errors",
        },
        body: {
          es: [
            "Etiquetas con código de barras invertido o recortado suelen venir de mala orientación del documento o impresora con bandeja incorrecta.",
            "La combinación de texto de precio con barras finas obliga a revisar contrastes, especialmente en colores oscuros.",
            "No mezcles plantillas con alturas desiguales para el mismo pasillo de venta.",
          ],
          en: [
            "Inverted or clipped barcodes usually come from paper orientation or wrong tray selection.",
            "Combining price text with dense barcodes can reduce contrast, especially on dark backgrounds.",
            "Avoid mixing label sizes in the same shelf section to keep checkout and stock operations consistent.",
          ],
        },
      },
    ],
    faqs: [
      {
        question: {
          es: "¿Funciona para promociones y precios variables?",
          en: "Can it handle promotions and variable prices?",
        },
        answer: {
          es:
            "Sí, siempre que actualices el precio en tu catálogo y vuelvas a imprimir las etiquetas afectadas.",
          en: "Yes, as long as product prices are updated in source data and affected labels are reprinted.",
        },
      },
      {
        question: {
          es: "¿Qué tamaño recomienda para mostrador?",
          en: "What size is best for POS?",
        },
        answer: {
          es:
            "3x8 o 2x7 suelen ser los más estables para vista rápida, según distancia y tipo de producto.",
          en: "3x8 or 2x7 are often the most stable for quick POS viewing, depending on distance and product type.",
        },
      },
      {
        question: {
          es: "¿Puedo reimprimir solo productos afectados?",
          en: "Can I reprint only affected products?",
        },
        answer: {
          es:
            "Sí. Mantén solo esos productos en el panel y usa el selector para llenar las etiquetas del lote.",
          en: "Yes. Keep only affected products in the panel and fill only the required labels from selection.",
        },
      },
    ],
    keywords: {
      es: "etiquetas retail, punto de venta, etiquetas para tiendas, etiquetas con precio",
      en: "retail labels, POS labels, store label templates, shelf labels",
    },
    relatedIds: ["barcode-label-generator", "inventory-labeling"],
  },
};

export type SeoResourceSummary = Pick<
  SeoResource,
  "id" | "slug" | "title" | "summary"
>;

export const getAllResources = (): SeoResource[] => Object.values(SEO_RESOURCES);

export const getLocalizedResourceSummaries = (locale: Locale): SeoResourceSummary[] => {
  void locale;
  return getAllResources().map((resource) => ({
    slug: resource.slug,
    id: resource.id,
    title: resource.title,
    summary: resource.summary,
  }));
};

export const getResourceByLocaleAndSlug = (
  locale: Locale,
  slug: string,
): SeoResource | undefined =>
  getAllResources().find((resource) => resource.slug[locale] === slug);

export const getResourceById = (id: string): SeoResource | undefined => SEO_RESOURCES[id];

export const getLocalizedRelatedSlugs = (locale: Locale, relatedIds: string[]) =>
  relatedIds
    .map((id) => getResourceById(id))
    .filter((resource): resource is SeoResource => resource !== undefined)
    .map((resource) => ({
      slug: resource.slug[locale],
      title: resource.title[locale],
    }));

export const getAllResourceStaticParams = () =>
  locales.flatMap((locale) =>
    getAllResources().map((resource) => ({
      locale,
      slug: resource.slug[locale],
    })),
  );

export const getLocalizedHubTitle = (locale: Locale) => {
  const base = {
    es: "Recursos de Labbely",
    en: "Labbely Resources",
  } as const;
  return base[locale];
};

export const getLocalizedHubDescription = (locale: Locale) => {
  const base = {
    es: "Guías prácticas para acelerar tus flujos de etiquetado e impresiones por lotes en inventario, retail y Odoo.",
    en: "Practical guides to speed up label workflows and batch printing for inventory, retail, and Odoo.",
  } as const;
  return base[locale];
};

export const getLocalizedHubIntro = (locale: Locale) => {
  const base = {
    es: "Guía paso a paso para decidir plantillas, alinear hojas A4 y crear un sistema de etiquetado repetible.",
    en: "Step-by-step guidance to pick templates, align A4 sheets, and create a repeatable labeling system.",
  } as const;
  return base[locale];
};

export const getResourceLandingMeta = (locale: Locale, slug: string) => {
  const resource = getResourceByLocaleAndSlug(locale, slug);
  if (!resource) {
    return null;
  }

  return {
    title: resource.metaTitle[locale],
    description: resource.metaDescription[locale],
    keywords: resource.keywords[locale],
  };
};

