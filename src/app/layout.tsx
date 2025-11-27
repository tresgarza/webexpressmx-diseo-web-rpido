import type { Metadata, Viewport } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import { GoogleTagManager, GoogleTagManagerNoscript } from "@/components/GoogleTagManager";
import { FacebookPixel } from "@/components/FacebookPixel";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { CookieConsent } from "@/components/CookieConsent";

const siteUrl = "https://sitioexpress.mx";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SitioExpress.mx | Páginas Web Profesionales Rápidas",
    template: "%s | SitioExpress.mx",
  },
  description:
    "Creamos sitios web profesionales que impulsan ventas. Diseño moderno, desarrollo rápido y resultados medibles. Entrega rápida desde 2 días hábiles. Cotización instantánea en 30 segundos.",
  keywords: [
    "diseño web",
    "páginas web",
    "sitios web",
    "desarrollo web",
    "diseño web Monterrey",
    "páginas web profesionales",
    "landing pages",
    "tienda en línea",
    "web rápida",
    "cotización web",
    "agencia web México",
    "diseño web México",
    "sitio web para empresas",
    "crear página web",
  ],
  authors: [{ name: "SitioExpress", url: siteUrl }],
  creator: "SitioExpress",
  publisher: "SitioExpress",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: siteUrl,
    siteName: "SitioExpress.mx",
    title: "SitioExpress.mx | Páginas Web Profesionales Rápidas",
    description:
      "Creamos sitios web profesionales que impulsan ventas. Diseño moderno, desarrollo rápido y resultados medibles. Entrega rápida desde 2 días hábiles. Cotización instantánea en 30 segundos.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SitioExpress - Páginas Web Profesionales",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SitioExpress.mx | Páginas Web Profesionales Rápidas",
    description:
      "Creamos sitios web profesionales que impulsan ventas. Entrega rápida desde 2 días hábiles. Cotización instantánea en 30 segundos.",
    images: ["/og-image.jpg"],
    creator: "@sitioexpress",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  category: "technology",
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "SitioExpress",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo-sitioexpress.png`,
        width: 512,
        height: 512,
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+52-81-1636-4522",
        contactType: "sales",
        availableLanguage: ["Spanish"],
        areaServed: "MX",
      },
      sameAs: [
        "https://www.instagram.com/sitioexpress",
        "https://www.linkedin.com/company/sitioexpress",
      ],
    },
    {
      "@type": "LocalBusiness",
      "@id": `${siteUrl}/#localbusiness`,
      name: "SitioExpress",
      description:
        "Agencia de diseño y desarrollo web en Monterrey. Creamos páginas web profesionales con entrega rápida desde 2 días hábiles.",
      url: siteUrl,
      telephone: "+52-81-1636-4522",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Monterrey",
        addressRegion: "Nuevo León",
        addressCountry: "MX",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 25.6866,
        longitude: -100.3161,
      },
      priceRange: "$$$",
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "SitioExpress",
      description: "Páginas web profesionales con entrega rápida",
      publisher: { "@id": `${siteUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
      inLanguage: "es-MX",
    },
    {
      "@type": "Service",
      "@id": `${siteUrl}/#service`,
      name: "Diseño y Desarrollo Web",
      description:
        "Servicio de creación de páginas web profesionales. Incluye diseño personalizado, desarrollo responsive, SEO básico y entrega rápida.",
      provider: { "@id": `${siteUrl}/#organization` },
      serviceType: "Web Design",
      areaServed: {
        "@type": "Country",
        name: "México",
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Planes de Páginas Web",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Plan Starter",
              description: "Landing page profesional con entrega rápida",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Plan Business",
              description: "Sitio web multi-página en 3-10 días",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Plan Pro Plus",
              description: "Proyecto web completo con funcionalidades avanzadas",
            },
          },
        ],
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <GoogleTagManager />
        <GoogleAnalytics />
        <FacebookPixel />
      </head>
      <body className="antialiased">
        <GoogleTagManagerNoscript />
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        {children}
        <VisualEditsMessenger />
        <Toaster />
        <CookieConsent />
      </body>
    </html>
  );
}
