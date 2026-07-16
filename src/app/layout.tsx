import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Update to the real production domain on deploy — this backs canonical
// URLs and resolves relative OpenGraph/Twitter image paths.
const SITE_URL = "https://growthos.ai";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "GrowthOS AI — The AI Marketing Operating System", template: "%s" },
  description: "GrowthOS AI unifies content, social, SEO, analytics, reputation, CRM, local marketing, and paid ads into one AI-run marketing operating system.",
  keywords: ["AI marketing platform", "marketing operating system", "AI content generation", "marketing automation", "AI SEO tool"],
  openGraph: {
    siteName: "GrowthOS AI",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster position="bottom-right" richColors closeButton theme="system" />
        </ThemeProvider>
      </body>
    </html>
  );
}
