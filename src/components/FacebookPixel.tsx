"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || "626633394773155";

function getCookieConsent() {
  if (typeof window === "undefined") return null;
  try {
    const consent = localStorage.getItem("cookie_consent");
    return consent ? JSON.parse(consent) : null;
  } catch {
    return null;
  }
}

// Extend window type for Facebook Pixel
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
  }
}

export function FacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!FB_PIXEL_ID) return;

    // Check cookie consent
    const checkConsent = () => {
      const consent = getCookieConsent();
      // Load Facebook Pixel only if marketing cookies are accepted, or if no consent yet (default to true for initial load)
      if (!consent || consent.marketing) {
        setShouldLoad(true);
      }
    };

    checkConsent();

    // Listen for consent changes
    window.addEventListener("cookieConsentUpdated", checkConsent);
    return () => window.removeEventListener("cookieConsentUpdated", checkConsent);
  }, []);

  useEffect(() => {
    if (!FB_PIXEL_ID || typeof window === "undefined" || !shouldLoad) return;

    // Track page view on route change
    if (window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [pathname, searchParams, shouldLoad]);

  if (!FB_PIXEL_ID || !shouldLoad) return null;

  return (
    <>
      <Script
        id="fb-pixel-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

// Helper functions to track events
export function trackFBEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, params);
  }
}

export function trackFBCustomEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", eventName, params);
  }
}

