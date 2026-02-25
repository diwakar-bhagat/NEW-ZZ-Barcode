# Checklist de Implementación SEO - Labbely

Fecha: 2026-02-25  
Propósito: convertir recomendaciones en tareas ejecutables y dejar trazabilidad de implementación real.

**Estado actual del proyecto**: dominio esperado y stack definidos; sitio Next.js con `next-intl` y landing en `/{locale}`.

## 0) Implementación hecha (confirmada)

- [x] `app/sitemap.ts` limpia rutas transaccionales (`/login`, `/app`) y deja solo páginas publicadas.
- [x] `app/sitemap.ts` agrega `x-default` en alternates por locale.
- [x] `app/sitemap.ts` usa fecha de último cambio estable (const de módulo), no `new Date()` en cada request.
- [x] `app/[locale]/login/layout.tsx` añade robots `index: false, follow: false`.
- [x] `app/[locale]/app/layout.tsx` añade robots `index: false, follow: false`.
- [x] `lib/seo.ts` exige `NEXT_PUBLIC_SITE_URL` en production.
- [x] `middleware.ts` elimina logs por request en producción (ya no hay consola en caliente).
- [x] Hero principal migrado a `next/image` con `priority` y `fetchPriority`.
- [x] Imágenes de feature/use case migradas a `next/image` con `width`/`height`.
- [x] Logo nav/footer/login migrados a `next/image` con tamaños explícitos.
- [x] `next.config.ts` agrega `images.remotePatterns` para `images.unsplash.com`.
- [x] `components/landing` actualizado para pasar `imageWidth` / `imageHeight` desde contenido.

## 1) SEO técnico (P0)

- [x] Canonical, alternates e hreflang en home
  - [x] Canonical generado desde `getCanonicalUrl(locale)`.
  - [x] `alternates.languages` e `x-default` en home.
  - [x] Metadata `openGraph.url` alineado al canonical.
- [ ] `app/[locale]/login/page.tsx` y `app/[locale]/app/page.tsx` validados como non-indexables en HTML final (seguir con inspección manual en deploy).
- [ ] Comprobar que no hay otras rutas con contenido indexable accidental.
- [ ] Revisar `robots.txt` en producción y validar bloqueos no deseados.

## 2) Rendimiento y Web Vitals (P0 → P1)

- [x] Hero `LCP` migrado para servir imagen optimizada con prioridad.
- [x] Imágenes pesadas pasadas a `next/image` con `width`/`height`.
- [ ] Añadir `srcSet`/`sizes` más fino cuando se revise breakpoint por breakpoint real.
- [ ] Medir bundle del primer render y reducir dependencias pesadas del bundle inicial.
- [ ] Definir cache-control y compresión de `public/brand/mockup-hero.png` (si se sigue sirviendo local).
- [ ] Medir LCP/INP/CLS desde Lighthouse tras cada release.

## 3) Arquitectura de contenido (P1)

- [ ] Crear clúster de 3-5 landings SEO por intención:
  - [ ] Generador de etiquetas de codigo de barras online.
  - [ ] Etiquetas A4 imprimibles (4x13, 3x8, 2x7).
  - [ ] Etiquetas para Odoo 17.
  - [ ] Etiquetas para inventario / almacén.
  - [ ] Plantillas de etiquetas para retail.
- [ ] Vinculación interna desde home hacia clúster + retorno desde contenido a `/{locale}/app`.
- [ ] Implementar FAQ solo donde exista demanda real + `FAQPage` válido en schema (si aplica).

## 4) Métricas y medición (P0 → continuo)

- [ ] Configurar Search Console y enviar sitemap.
- [ ] Configurar GA4 (o alternativa) con eventos:
  - [ ] `view_home`
  - [ ] `click_open_app`
  - [ ] `click_connect_odoo`
  - [ ] `start_print`
- [ ] Definir dashboard semanal con:
  - [ ] impresiones
  - [ ] clics
  - [ ] CTR
  - [ ] consultas no marca
  - [ ] páginas indexadas

## 5) Riesgo SEO y calidad

- [ ] Revisar contenido en ambos idiomas antes de publicar para evitar duplicación mala.
- [ ] Validar schema con herramienta de Google antes de activar páginas nuevas.
- [ ] Bloquear indexación de cualquier zona privada o demo interna en metadata.

## 6) Rutina semanal

- [ ] 1) Revisar Search Console: índices, impresiones, CTR bajo.
- [ ] 2) Revisar Lighthouse de `/es` y `/en` home.
- [ ] 3) Publicar o mejorar 1 contenido.
- [ ] Ajustar enlaces internos hacia páginas en crecimiento.
- [ ] Revisar `sitemap.xml` y validar `200` del archivo.

## 7) Referencias técnicas obligatorias

- Google SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide  
- Search Essentials: https://developers.google.com/search/docs/essentials  
- Robots meta tag: https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag  
- Sitemaps: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap  
- Search Console: https://developers.google.com/search/docs/monitor-debug/search-console-start  
- INP (web.dev): https://web.dev/inp/

## 8) Criterio de finalización

- [ ] Sin errores de indexación en páginas de producto (`/es` y `/en`).
- [ ] Páginas de conversión (`/login`, `/app`) no aparecen en sitemap.
- [ ] `robots` y `canonical` consistentes con dominio real.
- [ ] LCP medido con tendencia a bajar en cada release.
- [ ] Primer lote de landings SEO activas en `en` y `es`.