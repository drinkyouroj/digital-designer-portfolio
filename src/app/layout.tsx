import type { Metadata } from "next";
import { Manrope, Fragment_Mono, Onest } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

const fragmentMono = Fragment_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-fragment",
  display: "swap",
});

const onest = Onest({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-onest",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Digital Product Designer",
  description: "Portfolio of a digital product designer based in New York City.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${fragmentMono.variable} ${onest.variable} h-full`}
    >
      <body className="min-h-full bg-cream text-ink font-sans antialiased">
        <CustomCursor />
        <main>{children}</main>
      </body>
    </html>
  );
}
