import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Providers from "@/components/providers";
import Navbar from "@/components/navbar";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Recipe Vault | Discover, Organize & Preserve Your Recipes",
  description: "A premium digital cookbook and recipe management system to search, filter, export, import and build your personal collection of culinary masterpieces.",
  keywords: ["recipes", "cooking", "cookbook", "culinary journal", "meal planning", "food management"],
  openGraph: {
    title: "Recipe Vault | Personal Culinary Archive",
    description: "Discover, organize, and preserve your favorite recipes instantly.",
    type: "website",
    locale: "en_US",
    url: "https://recipe-vault.vercel.app",
    siteName: "Recipe Vault",
  },
  twitter: {
    card: "summary_large_image",
    title: "Recipe Vault | Personal Culinary Archive",
    description: "Discover, organize, and preserve your favorite recipes instantly.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#0F172A]">
        <Providers>
          <Navbar />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}


