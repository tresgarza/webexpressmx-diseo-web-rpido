"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || "G-QKL95SX2EX";
// Google Ads Conversion ID - set via environment variable
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "";
// Google Ads Conversion Label for Lead events
const GOOGLE_ADS_CONVERSION_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL || "";

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

  // Build the inline initialization script
  // This MUST run BEFORE the gtag.js script loads
  const initScript = [
    "window.dataLayer = window.dataLayer || [];",
    "function gtag(){dataLayer.push(arguments);}",
    "gtag('js', new Date());",
    `gtag('config', '${GA4_ID}');`,
    GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : "",
    `console.log('[GA4] Initialized: ${GA4_ID}');`,
    GOOGLE_ADS_ID ? `console.log('[Google Ads] Initialized: ${GOOGLE_ADS_ID}');` : "",
  ].filter(Boolean).join("\n");

  return (
    <>
      {/* Initialize dataLayer and gtag BEFORE the script loads */}
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: initScript }}
      />
      {/* Load the gtag.js script */}
      <Script
        id="gtag-script"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
        strategy="afterInteractive"
        onError={(e) => console.error("[GA4] Failed to load:", e)}
      />
    </>
  );
}

// Export Google Ads config for use in tracking events
export const googleAdsConfig = {
  id: GOOGLE_ADS_ID,
  conversionLabel: GOOGLE_ADS_CONVERSION_LABEL,
};

// Helper function to track Google Ads conversions
export function trackGoogleAdsConversion(data?: {
  value?: number;
  currency?: string;
  transactionId?: string;
}) {
  if (typeof window === "undefined" || !window.gtag || !GOOGLE_ADS_ID || !GOOGLE_ADS_CONVERSION_LABEL) {
    return;
  }

  window.gtag("event", "conversion", {
    send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`,
    value: data?.value,
    currency: data?.currency || "MXN",
    transaction_id: data?.transactionId,
  });
}

// Hash function for Enhanced Conversions (SHA-256)
async function hashForEnhancedConversions(value: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto) return value;
  
  const encoder = new TextEncoder();
  const data = encoder.encode(value.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Normalize phone number for Enhanced Conversions
function normalizePhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const digits = phone.replace(/\D/g, "");
  // For Mexico, ensure format is +52XXXXXXXXXX
  if (digits.length === 10) {
    return `+52${digits}`;
  }
  if (digits.startsWith("52") && digits.length === 12) {
    return `+${digits}`;
  }
  return phone;
}

/**
 * Set user data for Google Enhanced Conversions
 * Call this when user provides their email/phone (e.g., in forms)
 */
export async function setGoogleEnhancedConversionsData(userData: {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  address?: {
    street?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
}) {
  if (typeof window === "undefined" || !window.gtag) return;

  const enhancedData: Record<string, string> = {};

  // Hash PII data
  if (userData.email) {
    enhancedData.sha256_email_address = await hashForEnhancedConversions(userData.email);
  }
  if (userData.phone) {
    enhancedData.sha256_phone_number = await hashForEnhancedConversions(normalizePhoneNumber(userData.phone));
  }
  if (userData.firstName) {
    enhancedData.sha256_first_name = await hashForEnhancedConversions(userData.firstName);
  }
  if (userData.lastName) {
    enhancedData.sha256_last_name = await hashForEnhancedConversions(userData.lastName);
  }

  // Address data (not hashed)
  if (userData.address) {
    if (userData.address.street) enhancedData.address_street = userData.address.street;
    if (userData.address.city) enhancedData.address_city = userData.address.city;
    if (userData.address.region) enhancedData.address_region = userData.address.region;
    if (userData.address.postalCode) enhancedData.address_postal_code = userData.address.postalCode;
    if (userData.address.country) enhancedData.address_country = userData.address.country || "MX";
  }

  // Set user data for Enhanced Conversions
  window.gtag("set", "user_data", enhancedData);

  // Store for persistence
  localStorage.setItem("google_user_data", JSON.stringify(enhancedData));
}

/**
 * Track Google Ads conversion with Enhanced Conversions user data
 */
export async function trackGoogleAdsConversionWithUserData(
  conversionData: {
    value?: number;
    currency?: string;
    transactionId?: string;
  },
  userData?: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  }
) {
  if (typeof window === "undefined" || !window.gtag || !GOOGLE_ADS_ID || !GOOGLE_ADS_CONVERSION_LABEL) {
    return;
  }

  // Set user data for Enhanced Conversions if provided
  if (userData) {
    await setGoogleEnhancedConversionsData(userData);
  }

  // Track the conversion
  window.gtag("event", "conversion", {
    send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`,
    value: conversionData.value,
    currency: conversionData.currency || "MXN",
    transaction_id: conversionData.transactionId,
  });
}

