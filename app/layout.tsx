import type { Metadata } from "next";
import { Big_Shoulders, Lexend_Deca } from "next/font/google";
import "./globals.css";

const bigShoulders = Big_Shoulders({ subsets: ["latin"], axes: ["opsz"], variable: "--font-big-shoulders", display: "swap" });
const lexendDeca = Lexend_Deca({ subsets: ["latin"], weight: "400", variable: "--font-lexend-deca", display: "swap" });

const siteName = "3-column preview card";
const siteUrl = "https://three-column-preview-card-fm.royeradames.com/";
const title = "3-column preview card | Royer Adames";
const description = "Sedan, SUV and luxury car rental categories in three colored columns, rebuilt from the Frontend Mentor 3-column preview card design.";

export const metadata: Metadata = {
  title,
  description,
  icons: { icon: "/images/favicon-32x32.png" },
  openGraph: { type: "website", siteName, title, description, url: siteUrl },
};

const webSite = { "@context": "https://schema.org", "@type": "WebSite", name: siteName, url: siteUrl };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${bigShoulders.variable} ${lexendDeca.variable}`}><body>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSite) }} /></body></html>;
}
