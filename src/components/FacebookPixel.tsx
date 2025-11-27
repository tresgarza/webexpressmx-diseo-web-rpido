"use client";

import Script from "next/script";
import { useEffect, useState, Suspense } from "react";
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
    fbq: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
      push?: (...args: unknown[]) => void;
    };
    _fbq: unknown;
  }
}

function FacebookPixelContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!FB_PIXEL_ID) return;

    // Check cookie consent
    const checkConsent = () => {
      const consent = getCookieConsent();
      // Load Facebook Pixel only if marketing cookies are accepted, or if no consent yet
      if (!consent || consent.marketing) {
        setShouldLoad(true);
      }
    };

    checkConsent();

    // Listen for consent changes
    window.addEventListener("cookieConsentUpdated", checkConsent);
    return () => window.removeEventListener("cookieConsentUpdated", checkConsent);
  }, []);

  // Track page views on route changes (after initial load)
  useEffect(() => {
    if (!FB_PIXEL_ID || typeof window === "undefined" || !isInitialized) return;

    // Track page view on route change
    if (window.fbq) {
      window.fbq("track", "PageView");
      console.log("[FB Pixel] PageView tracked on route change:", pathname);
    }
  }, [pathname, searchParams, isInitialized]);

  if (!FB_PIXEL_ID || !shouldLoad) return null;

  // Official Facebook Pixel base code
  const fbPixelInitScript = [
    "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');",
    `fbq('init', '${FB_PIXEL_ID}');`,
    "fbq('track', 'PageView');",
    "console.log('[FB Pixel] Initialized and PageView tracked');",
  ].join("\n");

  return (
    <>
      {/* Facebook Pixel - use official snippet */}
      <Script
        id="fb-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: fbPixelInitScript }}
        onLoad={() => setIsInitialized(true)}
      />
      {/* Noscript fallback for users without JavaScript */}
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

export function FacebookPixel() {
  return (
    <Suspense fallback={null}>
      <FacebookPixelContent />
    </Suspense>
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

// Hash function for Advanced Matching (SHA-256)
async function hashForAdvancedMatching(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Normalize phone number for Advanced Matching
function normalizePhone(phone: string): string {
  // Remove all non-numeric characters
  const digits = phone.replace(/\D/g, "");
  // Remove country code if present (52 for Mexico)
  if (digits.startsWith("52") && digits.length > 10) {
    return digits.slice(2);
  }
  return digits;
}

/**
 * Set user data for Facebook Advanced Matching
 * Call this when user provides their email/phone (e.g., in forms)
 */
export async function setFBAdvancedMatchingData(userData: {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}) {
  if (typeof window === "undefined") return;

  const matchingData: Record<string, string> = {};

  if (userData.email) {
    matchingData.em = await hashForAdvancedMatching(userData.email);
  }
  if (userData.phone) {
    matchingData.ph = await hashForAdvancedMatching(normalizePhone(userData.phone));
  }
  if (userData.firstName) {
    matchingData.fn = await hashForAdvancedMatching(userData.firstName);
  }
  if (userData.lastName) {
    matchingData.ln = await hashForAdvancedMatching(userData.lastName);
  }

  // Store for persistence
  localStorage.setItem("fb_user_data", JSON.stringify(matchingData));

  // Update Facebook Pixel with user data if already initialized
  if (window.fbq) {
    window.fbq("init", FB_PIXEL_ID, matchingData);
  }
}

/**
 * Track event with Advanced Matching user data
 */
export async function trackFBEventWithUserData(
  eventName: string, 
  params?: Record<string, unknown>,
  userData?: {
    email?: string;
    phone?: string;
    firstName?: string;
  }
) {
  if (typeof window === "undefined" || !window.fbq) return;

  // If user data provided, set it for Advanced Matching
  if (userData) {
    await setFBAdvancedMatchingData(userData);
  }

  // Track the event
  window.fbq("track", eventName, params);
}

