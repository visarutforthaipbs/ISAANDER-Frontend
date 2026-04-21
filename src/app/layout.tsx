import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { PageLoading } from "@/components/page-loading";

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
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.theisaander.com";
const defaultOgImage = `${baseUrl}/og-default.jpg`;

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
  other: {
    preconnect: [
      "https://static.wixstatic.com",
      "https://www.googletagmanager.com",
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
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
    logo: `${baseUrl}/logo.png`,
    sameAs: [
      "https://www.facebook.com/TheIsaander",
      "https://twitter.com/TheIsaander"
    ]
  };

  return (
    <html
      lang="th"
      className={`${dbHelvethaica.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#C15C3D" />
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
