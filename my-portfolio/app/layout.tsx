import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { site } from "@/data/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Warm display serif for headings.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

// Get site URL from environment variable (set NEXT_PUBLIC_SITE_URL in Cloud Run).
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-site-url.com";

const metadataConfig: Metadata = {
  title: {
    default: `${site.name} | ${site.role}`,
    template: `%s | ${site.name}`,
  },
  description:
    "Yashkaran Chauhan — AI/ML engineer and researcher. Georgia Tech MSCS (AI). Building LLM evaluation systems and researching adversarial machine-learning security.",
  keywords: [
    "Yashkaran Chauhan",
    "AI engineer",
    "machine learning",
    "ML security",
    "LLM",
    "adversarial machine learning",
    "Georgia Tech",
    "Next.js",
    "portfolio",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.name,
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: `${site.name} Portfolio`,
    title: `${site.name} | ${site.role}`,
    description:
      "AI/ML engineer and researcher. Building LLM evaluation systems and researching adversarial ML security.",
    images: [
      { url: "/og-image.png", width: 1200, height: 630, alt: `${site.name} Portfolio` },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | ${site.role}`,
    description:
      "AI/ML engineer and researcher. Building LLM evaluation systems and researching adversarial ML security.",
    images: ["/og-image.png"],
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
};

if (siteUrl !== "https://your-site-url.com") {
  metadataConfig.metadataBase = new URL(siteUrl);
  if (metadataConfig.openGraph) {
    metadataConfig.openGraph.url = siteUrl;
  }
}

export const metadata = metadataConfig;

// Runs before first paint to set the theme and avoid a flash of the wrong theme.
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} font-sans antialiased`}
      >
        <Navbar />
        <div className="min-h-screen">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
