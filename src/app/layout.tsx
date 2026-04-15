import type { Metadata } from "next";
import { Nunito, Figtree } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Tavern Creative | Wedding Stationery",
    template: "%s | Tavern Creative",
  },
  description:
    "Award-winning wedding stationery studio. Personalise and order beautifully printed invitations, save the dates, and on-the-day stationery.",
  keywords: [
    "wedding stationery",
    "wedding invitations",
    "save the dates",
    "personalised stationery",
    "printed invitations",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} ${figtree.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
