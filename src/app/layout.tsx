import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CM Kerala Grievance Portal",
    template: "%s · CM Kerala Grievance Portal",
  },
  description:
    "A transparent grievance redressal platform for the Chief Minister's Office, Kerala. Submit, route, track and resolve citizen grievances.",
  applicationName: "CM Kerala Grievance Portal",
  keywords: ["Kerala", "grievance", "CMO", "redressal", "citizen portal"],
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#1a5641",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand-800 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
