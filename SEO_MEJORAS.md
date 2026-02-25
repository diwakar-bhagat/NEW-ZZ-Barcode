# Mejora SEO y Posicionamiento - Labbely

Fecha: 2026-02-25  
Sitio base: `/{locale}` en Next.js + `next-intl`  
Objetivo: pasar de una landing indexable a un ecosistema de captación continuo.

## 1) Diagnóstico actualizado

### Hallazgos que frenan el crecimiento
- Captación concentrada en una sola URL indexable.
- `/login` y `/app` podían aparecer en sitemap antes del ajuste.
- Base URL de SEO no era estricta en producción.
- Rendimiento alto en LCP por imagen principal y recursos de imagen con carga no optimizada.
- Faltaba implementación de control editorial de keywords y contenidos por intencionalidad.

### Bloques ya resueltos en código
- Sitemap limpiado de rutas transaccionales.
- SEO de `/login` y `/app` convertido a `noindex`.
- Base URL estricta en producción con validación en `lib/seo.ts`.
- Hero y bloques de imagen de landing migrados a `next/image`.
- Configuración de imágenes remotas para Unsplash en `next.config.ts`.

## 2) Qué va a impactar más rápido

### Prioridad 0 (semana 1)
1. **Indexación y canonical**: asegurar que solo indexa contenido de negocio.
2. **Noindex en rutas internas**: `login` y `app` fuera de SERPs.
3. **LCP real**: imagen hero priorizada + ancho/alto definido.
4. **Auditoría repetible**: comando estándar de Lighthouse para ES y EN.

### Prioridad 1 (semanas 2-4)
1. **Cluster de contenido inicial**: 3-5 páginas de intención clara (barra de búsqueda, keywords).
2. **Enlazado interno estratégico**: home -> landing de intención -> guías -> `/app`.
3. **Schema real** (solo si hay contenido sólido): FAQ/schema adicional y ajustes `SoftwareApplication`.

### Prioridad 2 (mes 2-3)
1. **Autoridad temática**: tutoriales técnicos en foros/comunidad Odoo.
2. **Backlinks de utilidad**: casos, posts, integraciones.
3. **Ritmo de publicación** constante.

## 3) Keywords y estructura de URLs recomendada

### Cluster 1: Etiquetas de código de barras
- "generador de etiquetas de codigo de barras"
- "etiquetas codigo de barras odoo"

### Cluster 2: Etiquetas A4
- "etiquetas a4 imprimibles"
- "plantillas etiquetas a4 4x13"

### Cluster 3: Integración
- "integrar odoo con etiquetas"
- "etiquetas odoo api rest rpc"

### Cluster 4: Operación
- "alinear etiquetas al imprimir"
- "etiquetas inventario almacen"

### Cluster 5: Búsquedas comerciales
- "software etiquetas para tienda"
- "generador etiquetas gratis"

## 4) Arquitectura de contenido propuesta

- [ ] Página pilar por cluster con objetivo único.
- [ ] 2-4 contenidos de soporte por pilar (tutoriales cortos).
- [ ] Una sección de "casos de uso" con ejemplo por industria.
- [ ] CTA secundarios consistentes:
  - `Probar ahora` → `/{locale}/app`
  - `Conectar Odoo` → `/{locale}/login`
- [ ] Contenido en ES y EN con calidad equivalente (no traducción automática directa).

## 5) Stack técnico SEO a mantener

- Canonical y alternates centralizados en funciones de `lib/seo.ts`.
- Layout de locale para metadatos base (`app/[locale]/layout.tsx`).
- Landing metadata y schema en `app/[locale]/page.tsx`.
- Landing components optimizadas con `next/image`.
- Logs de request desactivados en middleware para no contaminar rendimiento/logs.

## 6) Métricas de éxito (90 días)

- [ ] Crecer impresiones orgánicas no marca.
- [ ] Reducir LCP de home bajo 4s en laboratorio.
- [ ] Añadir al menos 5 páginas con intención SEO activa.
- [ ] Mantener tasa de indexación de URLs SEO > 80%.
- [ ] Medir CTR mejorado en title/description de home y de nuevas landings.

## 7) Checklist operativo semanal

- [ ] Revisar Search Console (indexación + queries nuevas).
- [ ] Revisar Lighthouse de `/es` y `/en`.
- [ ] Actualizar 1 contenido nuevo o optimizar 1 existente.
- [ ] Revisar enlaces internos hacia páginas con mejor rendimiento.
- [ ] Actualizar KPIs y mover tareas atrasadas en el checklist.

## 8) Referencias base
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- https://developers.google.com/search/docs/essentials
- https://developers.google.com/search/docs/monitor-debug/search-console-start
- https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://web.dev/inp/