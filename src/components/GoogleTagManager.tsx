"use client";

import { useEffect, useState } from "react";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-KLPJG4Z2";

function getCookieConsent() {
  if (typeof window === "undefined") return null;
  try {
    const consent = localStorage.getItem("cookie_consent");
    return consent ? JSON.parse(consent) : null;
  } catch {
    return null;
  }
}

// Extend window type for dataLayer
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

export function GoogleTagManager() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!GTM_ID) return;

    // Check cookie consent
    const checkConsent = () => {
      const consent = getCookieConsent();
      // Load GTM if analytics or marketing cookies are accepted, or if no consent yet
      if (!consent || consent.analytics || consent.marketing) {
        setShouldLoad(true);
      }
    };

    checkConsent();

    // Listen for consent changes
    window.addEventListener("cookieConsentUpdated", checkConsent);
    return () => window.removeEventListener("cookieConsentUpdated", checkConsent);
  }, []);

  // Initialize GTM via useEffect for cleaner approach
  useEffect(() => {
    if (!shouldLoad || !GTM_ID || typeof window === "undefined") return;

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      "gtm.start": new Date().getTime(),
      event: "gtm.js",
    });

    // Check if GTM script already exists
    const existingScript = document.querySelector(`script[src*="googletagmanager.com/gtm.js?id=${GTM_ID}"]`);
    if (existingScript) return;

    // Load GTM script
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    script.async = true;
    script.onload = () => {
      console.log("[GTM] Loaded:", GTM_ID);
    };
    document.head.appendChild(script);
  }, [shouldLoad]);

  return null;
}

export function GoogleTagManagerNoscript() {
  if (!GTM_ID) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}

