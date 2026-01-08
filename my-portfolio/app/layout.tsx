import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Get site URL from environment variable
// Set NEXT_PUBLIC_SITE_URL in your Cloud Run environment variables
// After deployment, get your URL with: gcloud run services describe SERVICE_NAME --region=REGION --format="value(status.url)"
// Then set it in Cloud Run: gcloud run services update SERVICE_NAME --set-env-vars="NEXT_PUBLIC_SITE_URL=https://your-url.run.app"
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-site-url.com';

// Build metadata object
const metadataConfig: Metadata = {
  title: {
    default: "Yashkaran Chauhan | Portfolio",
    template: "%s | Yashkaran Chauhan"
  },
  description: "Software engineer focused on building modern web applications, polished UI experiences, and meaningful technology projects. Portfolio showcasing projects, blog posts, and professional experience.",
  keywords: ["Yashkaran Chauhan", "software engineer", "web developer", "Next.js", "portfolio", "machine learning"],
  authors: [{ name: "Yashkaran Chauhan" }],
  creator: "Yashkaran Chauhan",
  publisher: "Yashkaran Chauhan",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Yashkaran Chauhan Portfolio',
    title: 'Yashkaran Chauhan | Software Engineer & Web Developer',
    description: 'Software engineer focused on building modern web applications, polished UI experiences, and meaningful technology projects.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Yashkaran Chauhan Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yashkaran Chauhan | Software Engineer & Web Developer',
    description: 'Software engineer focused on building modern web applications, polished UI experiences, and meaningful technology projects.',
    images: ['/og-image.png'],
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

// Set metadataBase and URL only if siteUrl is configured
if (siteUrl !== 'https://your-site-url.com') {
  metadataConfig.metadataBase = new URL(siteUrl);
  if (metadataConfig.openGraph) {
    metadataConfig.openGraph.url = siteUrl;
  }
}

export const metadata = metadataConfig;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="
                fixed top-4 left-1/2 -translate-x-1/2
                inline-flex w-fit items-center gap-6
                px-6 py-3
                rounded-full

                /* Glass effect */
                bg-[--background]/30
                dark:bg-[--background]/20
                backdrop-blur-xl

                /* Glossy highlights */
                border border-white/20 dark:border-white/10
                shadow-[0_4px_20px_rgba(0,0,0,0.15)]
                dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]

                /* Smooth interaction */
                transition-all duration-300
                hover:bg-[--background]/40 hover:shadow-[0_6px_28px_rgba(0,0,0,0.25)]
                hover:scale-[1.01]

                z-50
            ">
                <div className="flex items-center gap-6 text-sm font-medium text-ink/subtle">
                    <a href="/about" className="hover:text-brand transition">About</a>
                    <a href="/projects" className="hover:text-brand transition">Projects</a>
                    <a href="/projects" className="hover:text-brand transition">Interests</a>
                    <a href="/resume" className="hover:text-brand transition">Resume</a>
                    <a href="/blog" className="hover:text-brand transition">Blog</a>
                    <a href="/contact" className="hover:text-brand transition">Contact</a>
                </div>
            </nav>
        <main className="pt-20">
            <div style={{ height: '65px' }} aria-hidden="true" />
            {children}
        </main>
      </body>
    </html>
  );
}
