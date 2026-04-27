import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import ThemeSync from "@/components/ThemeSync";
import {
  isValidThemeId,
  isValidThemeMode,
  DEFAULT_THEME_ID,
  DEFAULT_THEME_MODE,
} from "@/lib/themes/registry";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: "Forte - AI resume tailoring",
  description: "Paste your resume and a job description. Get a tailored, ATS-optimized version in seconds.",
  icons: [
    { rel: 'icon', url: '/brand/forte-icon-sora-dark.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: light)' },
    { rel: 'icon', url: '/brand/forte-icon-sora-light.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: dark)' },
  ],
  openGraph: {
    siteName: "Forte",
    title: "Forte - AI resume tailoring",
    description: "Paste your resume and a job description. Get a tailored, ATS-optimized version in seconds.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies()
  const rawId   = cookieStore.get('theme-id')?.value   ?? ''
  const rawMode = cookieStore.get('theme-mode')?.value ?? ''
  const themeId   = isValidThemeId(rawId)     ? rawId   : DEFAULT_THEME_ID
  const themeMode = isValidThemeMode(rawMode) ? rawMode : DEFAULT_THEME_MODE

  return (
    <html
      lang="en"
      data-theme-id={themeId}
      data-theme={themeMode}
      className={`h-full antialiased ${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
        <ThemeSync />
      </body>
    </html>
  );
}
