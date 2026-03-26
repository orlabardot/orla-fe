import type { Metadata } from "next";
import { Playfair_Display, Inter, JetBrains_Mono, Geist } from "next/font/google";
import { Providers } from "@/components/layout/providers";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ótica Manager",
  description: "Gestão de catálogo para óticas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={cn("dark", "font-sans", geist.variable)} suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${inter.variable} ${mono.variable} font-inter`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
