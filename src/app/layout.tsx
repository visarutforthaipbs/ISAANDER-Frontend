import type { Metadata } from "next";
import localFont from "next/font/local";
import { Sarabun, Prompt } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { PageLoading } from "@/components/page-loading";
import { ReaderPreferencesLoader } from "@/components/reader-preferences-loader";

// `display: "optional"` eliminates font-swap CLS — the browser uses the
// fallback if the custom font isn't ready within ~100ms (no late swap).
// Tuned fallback metrics keep the fallback close in size so even when the
// custom font does paint, the shift is negligible.
const dbHelvethaica = localFont({
  src: [
    {
      path: "../public/fonts/dbhelvethaicax-webfont.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/dbhelvethaicaxmed-webfont.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/dbhelvethaicaxbd-webfont.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-dbhelvethaica",
  display: "optional",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Tahoma", "sans-serif"],
  preload: true,
});

const sarabun = Sarabun({
  weight: ["400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-sarabun-google",
  display: "swap",
});

const prompt = Prompt({
  weight: ["400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-prompt-google",
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.theisaander.com";
const defaultOgImage = `${baseUrl}/og-default.jpg`;
const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "googlee22f68b0780441e3";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "The Isaander | สำนักข่าวโดยคนอีสานเพื่อคนอีสานและคนที่ใช้ภาษาไทย",
    template: "%s | The Isaander",
  },
  description: "The Isaander สำนักข่าวโดยคนอีสานเพื่อคนอีสานและคนที่ใช้ภาษาไทย นำเสนอข่าวเชิงลึก สังคม การเมือง และวัฒนธรรม",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/SVG/favicon-real.svg",
  },
  openGraph: {
    title: "The Isaander | สำนักข่าวโดยคนอีสานเพื่อคนอีสานและคนที่ใช้ภาษาไทย",
    description: "The Isaander สำนักข่าวโดยคนอีสานเพื่อคนอีสานและคนที่ใช้ภาษาไทย นำเสนอข่าวเชิงลึก สังคม การเมือง และวัฒนธรรม",
    url: baseUrl,
    siteName: "The Isaander",
    locale: "th_TH",
    type: "website",
    images: [{ url: defaultOgImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Isaander",
    description: "สำนักข่าวโดยคนอีสานเพื่อคนอีสานและคนที่ใช้ภาษาไทย",
    images: [defaultOgImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: googleSiteVerification,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: "The Isaander",
    alternateName: "The Isaander สำนักข่าวโดยคนอีสานเพื่อคนอีสานและคนที่ใช้ภาษาไทย",
    url: "https://www.theisaander.com",
    logo: `${baseUrl}/logo-black.svg`,
    sameAs: [
      "https://www.facebook.com/TheIsaander",
      "https://twitter.com/TheIsaander"
    ]
  };

  return (
    <html
      lang="th"
      className={`${dbHelvethaica.variable} ${sarabun.variable} ${prompt.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#C15C3D" />
        {/* Preconnect to image CDN early so LCP image starts downloading sooner */}
        <link rel="preconnect" href="https://static.wixstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://static.wixstatic.com" />
        {gaMeasurementId && (
          <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        )}
        {/* AdSense script is NOT loaded eagerly here — `AdSenseSlot` injects
            it lazily via IntersectionObserver only when an ad scrolls near
            the viewport. This keeps ~180 KiB of unused JS off the critical
            path on every page. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">
          ข้ามไปยังเนื้อหาหลัก
        </a>
        <PageLoading />
        <ReaderPreferencesLoader />
        <AuthProvider>
          {gaMeasurementId && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
                strategy="afterInteractive"
              />
              <Script id="google-analytics" strategy="afterInteractive">
                {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaMeasurementId}');`}
              </Script>
            </>
          )}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
