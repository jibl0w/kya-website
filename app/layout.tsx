import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import PWAInstallBanner from "./components/PWAInstallBanner";

export const metadata: Metadata = {
  title: "KYA Digital Services",
  description: "Nigeria-Asia Cross-Border Trade Infrastructure Platform",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KYA",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "KYA Digital Services",
    title: "KYA — Nigeria-Asia Trade Infrastructure",
    description: "Secure cross-border trade between Nigeria and Asia",
  },
  icons: {
    icon: [
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#f59e0b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const isDevelopment = process.env.NEXT_PUBLIC_APP_ENV === "development";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard/onboarding"
      allowedRedirectOrigins={[
        "https://kya.com.ng",
        "https://www.kya.com.ng",
        "https://kya.ng",
        "https://staff.kya.ng",
        "https://dev.kya.com.ng",
        "https://dev-staff.kya.com.ng",
      ]}
    >
      <html lang="en">
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="KYA" />
          <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
          <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
          <meta name="msapplication-TileColor" content="#f59e0b" />
        </head>
        <body>
          {isDevelopment && (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
              background: "#f59e0b",
              color: "#0D1420",
              textAlign: "center",
              fontSize: "11px",
              fontWeight: "700",
              fontFamily: "Arial, sans-serif",
              letterSpacing: "2px",
              padding: "4px 0",
              textTransform: "uppercase",
            }}>
              ⚠ DEVELOPMENT ENVIRONMENT — NOT FOR LIVE USE
            </div>
          )}
          {children}
          <PWAInstallBanner />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(function(registration) {
                      console.log('KYA SW registered:', registration.scope);
                    }).catch(function(err) {
                      console.log('KYA SW registration failed:', err);
                    });
                  });
                }
              `,
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}