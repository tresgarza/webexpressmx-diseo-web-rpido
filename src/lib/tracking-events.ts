"use client";

// Extend window type for tracking
declare global {
  interface Window {
    dataLayer: unknown[];
    fbq: (...args: unknown[]) => void;
    gtag: (...args: unknown[]) => void;
  }
}

// Get UTM parameters from URL
export function getUTMParams(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const utmParams: Record<string, string> = {};

  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

  utmKeys.forEach((key) => {
    const value = params.get(key);
    if (value) {
      utmParams[key] = value;
    }
  });

  // Also capture gclid (Google Click ID) and fbclid (Facebook Click ID)
  const gclid = params.get("gclid");
  const fbclid = params.get("fbclid");
  if (gclid) utmParams.gclid = gclid;
  if (fbclid) utmParams.fbclid = fbclid;

  return utmParams;
}

// Store UTM params in session storage for persistence across pages
export function storeUTMParams() {
  if (typeof window === "undefined") return;

  const utmParams = getUTMParams();
  if (Object.keys(utmParams).length > 0) {
    sessionStorage.setItem("utm_params", JSON.stringify(utmParams));
  }
}

// Get stored UTM params
export function getStoredUTMParams(): Record<string, string> {
  if (typeof window === "undefined") return {};

  try {
    const stored = sessionStorage.getItem("utm_params");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Push event to GTM dataLayer
export function pushToDataLayer(event: string, data?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({
      event,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
}

// Track page view
export function trackPageView(pagePath?: string, pageTitle?: string) {
  const path = pagePath || (typeof window !== "undefined" ? window.location.pathname : "");
  const title = pageTitle || (typeof document !== "undefined" ? document.title : "");

  // GTM
  pushToDataLayer("page_view", {
    page_path: path,
    page_title: title,
  });

  // Facebook Pixel
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "PageView");
  }
}

// Track when user starts the quote wizard
export function trackQuoteStart(planId?: string, planName?: string) {
  const utmParams = getStoredUTMParams();

  // GTM
  pushToDataLayer("quote_start", {
    plan_id: planId,
    plan_name: planName,
    ...utmParams,
  });

  // Facebook Pixel - InitiateCheckout
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      content_name: planName || "Quote Wizard",
      content_category: "Web Design Service",
    });
  }
}

// Track when user selects a plan
export function trackPlanSelected(planId: string, planName: string, planPrice: number) {
  // GTM
  pushToDataLayer("plan_selected", {
    plan_id: planId,
    plan_name: planName,
    plan_price: planPrice,
  });

  // Facebook Pixel
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "AddToCart", {
      content_name: planName,
      content_type: "product",
      value: planPrice,
      currency: "MXN",
    });
  }
}

// Track when user provides phone number
export function trackPhoneProvided(step: number) {
  // GTM
  pushToDataLayer("phone_provided", {
    step,
  });

  // Facebook Pixel - Lead (partial)
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", "PhoneProvided", {
      step,
    });
  }
}

// Track lead conversion (form submitted)
export function trackLeadConversion(data: {
  planId?: string;
  planName?: string;
  planPrice?: number;
  email?: string;
  phone?: string;
  addons?: string[];
  totalValue?: number;
}) {
  const utmParams = getStoredUTMParams();

  // GTM - Main conversion event
  pushToDataLayer("generate_lead", {
    plan_id: data.planId,
    plan_name: data.planName,
    value: data.totalValue || data.planPrice,
    currency: "MXN",
    email: data.email,
    phone: data.phone,
    addons: data.addons,
    ...utmParams,
  });

  // Also push as purchase event for easier conversion tracking
  pushToDataLayer("purchase", {
    transaction_id: `lead_${Date.now()}`,
    value: data.totalValue || data.planPrice,
    currency: "MXN",
    items: [
      {
        item_id: data.planId,
        item_name: data.planName,
        price: data.planPrice,
        quantity: 1,
      },
    ],
  });

  // Facebook Pixel - Lead event
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Lead", {
      content_name: data.planName,
      content_category: "Web Design Service",
      value: data.totalValue || data.planPrice,
      currency: "MXN",
    });

    // Also track as CompleteRegistration for funnel tracking
    window.fbq("track", "CompleteRegistration", {
      content_name: data.planName,
      value: data.totalValue || data.planPrice,
      currency: "MXN",
    });
  }

  // Google Analytics 4 - Track conversion event
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "generate_lead", {
      value: data.totalValue || data.planPrice,
      currency: "MXN",
      plan_name: data.planName,
      plan_id: data.planId,
    });
  }
}

// Track thank you page view (for conversion tracking)
export function trackThankYouPage(data?: {
  planId?: string;
  planName?: string;
  totalValue?: number;
}) {
  // GTM
  pushToDataLayer("thank_you_page_view", {
    plan_id: data?.planId,
    plan_name: data?.planName,
    value: data?.totalValue,
  });

  // Facebook Pixel
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "ViewContent", {
      content_name: "Thank You Page",
      content_category: "Conversion",
      value: data?.totalValue,
      currency: "MXN",
    });
  }
}

// Track contact form submission (for non-quote leads)
export function trackContactSubmission(data: {
  formName?: string;
  email?: string;
  phone?: string;
}) {
  const utmParams = getStoredUTMParams();

  // GTM
  pushToDataLayer("contact_form_submit", {
    form_name: data.formName || "contact",
    ...utmParams,
  });

  // Facebook Pixel
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Contact", {
      content_name: data.formName || "Contact Form",
    });
  }
}

// Track schedule call click
export function trackScheduleCallClick() {
  // GTM
  pushToDataLayer("schedule_call_click");

  // Facebook Pixel
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Schedule", {
      content_name: "Schedule Call",
    });
  }
}

// Track WhatsApp click
export function trackWhatsAppClick(source?: string) {
  // GTM
  pushToDataLayer("whatsapp_click", {
    source: source || "unknown",
  });

  // Facebook Pixel
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", "WhatsAppClick", {
      source: source || "unknown",
    });
  }
}

// Initialize tracking on page load
export function initializeTracking() {
  if (typeof window === "undefined") return;

  // Store UTM params from URL
  storeUTMParams();

  // Initialize dataLayer if not exists
  window.dataLayer = window.dataLayer || [];

  // Track initial page view
  trackPageView();
}

