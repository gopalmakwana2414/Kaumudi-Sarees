"use client";

import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  /** Pixel height the logo renders at. Actually controls the rendered
   * size now (see fix note below) — pass a bigger number for a bigger logo. */
  height?: number;
  linkToHome?: boolean;
}

/**
 * Shared brand logo used across the Navbar, Footer, and Admin sidebar.
 *
 * Expects the logo file at /public/logo.png. Falls back to the
 * "SUHAGAN" wordmark if the image is missing/fails to load, so the site
 * never breaks while the asset is being added.
 *
 * BUG FIXES:
 * 1. Added "use client" — this component uses an onError event handler
 *    (a function), which can't be passed as a prop from a Server
 *    Component. Without this directive Next.js treated Logo as a Server
 *    Component by default and crashed trying to serialize the handler
 *    across the server/client boundary the moment it was used inside
 *    Footer.tsx (itself a Server Component).
 * 2. The `height` prop was accepted but never actually used for sizing —
 *    the rendered size was hardcoded via a fixed Tailwind class
 *    (`h-9 sm:h-11`, i.e. 36px/44px) regardless of what was passed in.
 *    That's why it always looked small everywhere, and why passing e.g.
 *    height={36} in the admin sidebar had no visible effect. Now sized
 *    via inline style driven by the actual prop.
 */
export default function Logo({
  className = "",
  height = 142,
  linkToHome = true,
}: LogoProps) {
  const image = (
    <Image
      src="/logo.png"
      alt="Suhagan — Premium Handcrafted Sarees"
      width={height * 3.2}
      height={height}
      priority
      style={{ height: `${height}px`, width: "auto" }}
      className={`object-contain ${className}`}
      onError={(e) => {
        // Graceful fallback if logo.png hasn't been added yet.
        (e.target as HTMLImageElement).style.display = "none";
        const fallback = (e.target as HTMLImageElement)
          .nextElementSibling as HTMLElement | null;
        if (fallback) fallback.style.display = "inline-block";
      }}
    />
  );

  const content = (
    <span className="inline-flex items-center mt-4">
      {image}
      <span
        style={{ display: "none", fontSize: `${height * 0.55}px` }}
        className="font-bold tracking-wide text-[#b8860b]"
      >
        SUHAGAN
      </span>
    </span>
  );

  if (!linkToHome) return content;

  return (
    <Link href="/" aria-label="Suhagan — Home">
      {content}
    </Link>
  );
}
