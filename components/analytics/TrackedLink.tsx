"use client";

import { type ReactNode, type MouseEvent } from "react";
import Link from "next/link";
import type { UrlObject } from "url";

import { trackConnectOdoo, trackOpenApp, trackResourceClick } from "@/lib/analytics";
import { type Locale } from "@/lib/i18n";

type ResourceTracking = {
  kind: "resource";
  source: string;
  destination: "app" | "login" | "resource_detail";
  resourceTitle: string;
  experiment?: string;
};

type TrackingConfig =
  | {
      kind: "open_app";
      source: string;
    }
  | {
      kind: "connect_odoo";
      source: string;
    }
  | ResourceTracking;

type TrackedLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "onClick"
> & {
  href: string | UrlObject;
  locale: Locale;
  tracking?: TrackingConfig;
  children: ReactNode;
};

function emitTracking(config: TrackingConfig, locale: Locale) {
  if (config.kind === "open_app") {
    trackOpenApp(locale, config.source);
    return;
  }

  if (config.kind === "connect_odoo") {
    trackConnectOdoo(locale, config.source);
    return;
  }

  trackResourceClick(
    locale,
    config.resourceTitle,
    config.destination,
    config.source,
    config.experiment,
  );
}

export function TrackedLink({
  href,
  locale,
  tracking,
  children,
  onMouseEnter,
  onPointerEnter,
  onClick,
  ...rest
}: TrackedLinkProps & {
  onMouseEnter?: React.AnchorHTMLAttributes<HTMLAnchorElement>["onMouseEnter"];
  onPointerEnter?: React.AnchorHTMLAttributes<HTMLAnchorElement>["onPointerEnter"];
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (tracking) {
      emitTracking(tracking, locale);
    }

    if (onClick) {
      onClick(event);
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onPointerEnter={onPointerEnter}
      {...rest}
    >
      {children}
    </Link>
  );
}
