"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || "G-QKL95SX2EX";

function getCookieConsent() {
  if (typeof window === "undefined") return null;
  try {
    const consent = localStorage.getItem("cookie_consent");
    return consent ? JSON.parse(consent) : null;
  } catch {
    return null;
  }
}

// Extend window type for gtag
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export function GoogleAnalytics() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!GA4_ID) return;

    // Check cookie consent
    const checkConsent = () => {
      const consent = getCookieConsent();
      // Load GA4 if analytics or marketing cookies are accepted, or if no consent yet
      if (!consent || consent.analytics || consent.marketing) {
        setShouldLoad(true);
      }
    };

    checkConsent();

    // Listen for consent changes
    window.addEventListener("cookieConsentUpdated", checkConsent);
    return () => window.removeEventListener("cookieConsentUpdated", checkConsent);
  }, []);

  if (!GA4_ID || !shouldLoad) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="ga4-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA4_ID}');
          `,
        }}
      />
    </>
  );
}

