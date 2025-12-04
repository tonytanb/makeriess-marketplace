import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ConfigureAmplifyClientSide } from "@/components/ConfigureAmplifyClientSide";
import { QueryProvider } from "@/components/providers/QueryProvider";
import PWAProvider from "@/components/pwa/PWAProvider";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { WebVitals } from "@/components/shared/WebVitals";
import { DemoModeToggle } from "@/components/shared/DemoModeToggle";

export const metadata: Metadata = {
  title: "Makeriess - Local Marketplace",
  description: "Discover and order from local makers, crafters, and food vendors",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Makeriess",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>
        <ErrorBoundary>
          <WebVitals />
          <ConfigureAmplifyClientSide />
          <QueryProvider>
            <PWAProvider>
              {children}
              <DemoModeToggle />
            </PWAProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
