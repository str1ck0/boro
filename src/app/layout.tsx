import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: "Boro — Don't buy it. Boro it.", template: "%s · Boro" },
  description:
    "Borrow the things you need from people nearby, and lend out the things you don't. Kayaks, cameras, tools, tents and more — in Cape Town.",
  applicationName: "Boro",
  appleWebApp: { capable: true, title: "Boro", statusBarStyle: "default" },
  openGraph: { siteName: "Boro", type: "website", locale: "en_ZA" },
};

export const viewport: Viewport = {
  themeColor: "#f7f6f3",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA" className={archivo.variable}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
