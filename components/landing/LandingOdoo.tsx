"use client";

import { ArrowRight, Check, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { LandingContainer } from "./LandingContainer";
import { LandingSection } from "./LandingSection";
import { LandingKicker } from "./LandingKicker";
import { LandingPill } from "./LandingPill";

import styles from "./LandingOdoo.module.css";
import type { LandingOdooProps } from "./types";

export function LandingOdoo({
  odooLabel,
  title,
  description,
  features,
  docsLabel,
  badgeJsonRpc,
  badgeRest,
  requestLabel,
  responseLabel,
  methodLabel,
  ctaLabel,
  loginHref,
  className = "",
  style,
}: LandingOdooProps) {
  return (
    <LandingSection className={`${styles.odoo} ${className}`} style={style} linesVariant="a">
      <LandingContainer>
        <div className={styles.grid}>
          <div className={styles.content}>
            <LandingPill variant="soft" className={styles.odooPill}>
              {odooLabel}
            </LandingPill>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.description}>{description}</p>
            <div className={styles.metaRow}>
              <a
                className={styles.docsLink}
                href="https://www.odoo.com/documentation/17.0/developer/reference/external_api.html"
                target="_blank"
                rel="noreferrer"
              >
                {docsLabel} <ExternalLink className="ml-1 h-3.5 w-3.5" />
              </a>
              <span className={styles.badge}>{badgeJsonRpc}</span>
              <span className={styles.badge}>{badgeRest}</span>
            </div>
            <ul className={styles.featureList}>
              {features.map((text, i) => (
                <li key={i} className={styles.featureItem}>
                  <Check className={styles.featureCheck} />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <Button asChild className={styles.cta}>
              <TrackedLink
                href={loginHref}
                locale="en"
                tracking={{ kind: "connect_odoo", source: "odoo" }}
              >
                {ctaLabel} <ArrowRight className="ml-2 h-4 w-4" />
              </TrackedLink>
            </Button>
          </div>
          <div className={styles.codeWrap}>
            <div className={styles.codeBlock}>
              <div className={styles.codeHeader}>
                <LandingKicker>api/products/search</LandingKicker>
                <span className={styles.codePill}>{methodLabel}</span>
              </div>
              <div className={styles.codeSection}>
                <span className={styles.codeLabel}>{requestLabel}</span>
                <pre className={styles.codeContent}>
                  <code className={styles.codeLine}>
                    <span className={styles.codeProp}>/api/products/search</span>
                  </code>
                  <code className={styles.codeLine}>
                    <span className={styles.codeBrace}>{"{"}</span>
                  </code>
                  <code className={styles.codeLine}>
                    {"  "}
                    <span className={styles.codeKey}>&quot;query&quot;</span>
                    {": "}
                    <span className={styles.codeString}>&quot;laptop&quot;</span>
                  </code>
                  <code className={styles.codeLine}>
                    <span className={styles.codeBrace}>{"}"}</span>
                  </code>
                </pre>
              </div>
              <div className={styles.codeDivider} />
              <div className={styles.codeSection}>
                <span className={styles.codeLabel}>{responseLabel}</span>
                <pre className={styles.codeContent}>
                  <code className={styles.codeLine}>
                    <span className={styles.codeBrace}>{"{"}</span>
                  </code>
                  <code className={styles.codeLine}>
                    {"  "}
                    <span className={styles.codeKey}>&quot;total&quot;</span>
                    {": "}
                    <span className={styles.codeNumber}>2</span>,
                  </code>
                  <code className={styles.codeLine}>
                    {"  "}
                    <span className={styles.codeKey}>&quot;items&quot;</span>
                    {": "}
                    <span className={styles.codeBrace}>[</span>
                    <span className={styles.codeString}>&quot;Laptop 13&quot;</span>,{" "}
                    <span className={styles.codeString}>&quot;Laptop 15&quot;</span>
                    <span className={styles.codeBrace}>]</span>
                  </code>
                  <code className={styles.codeLine}>
                    <span className={styles.codeBrace}>{"}"}</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
