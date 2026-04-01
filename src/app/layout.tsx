import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://www.theisaander.com"),
  title: {
    default: "The Isaander | สำนักข่าวโดยคนอีสานเพื่อคนอีสานและคนที่ใช้ภาษาไทย",
    template: "%s | The Isaander",
  },
  description: "The Isaander สำนักข่าวโดยคนอีสานเพื่อคนอีสานและคนที่ใช้ภาษาไทย นำเสนอข่าวเชิงลึก สังคม การเมือง และวัฒนธรรม",
  openGraph: {
    title: "The Isaander | สำนักข่าวโดยคนอีสานเพื่อคนอีสานและคนที่ใช้ภาษาไทย",
    description: "The Isaander สำนักข่าวโดยคนอีสานเพื่อคนอีสานและคนที่ใช้ภาษาไทย นำเสนอข่าวเชิงลึก สังคม การเมือง และวัฒนธรรม",
    url: "https://www.theisaander.com",
    siteName: "The Isaander",
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Isaander",
    description: "สำนักข่าวโดยคนอีสานเพื่อคนอีสานและคนที่ใช้ภาษาไทย",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: "The Isaander",
    alternateName: "The Isaander สำนักข่าวโดยคนอีสานเพื่อคนอีสานและคนที่ใช้ภาษาไทย",
    url: "https://www.theisaander.com",
    logo: "https://www.theisaander.com/logo.png",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">
          ข้ามไปยังเนื้อหาหลัก
        </a>
        {children}
      </body>
    </html>
  );
}
