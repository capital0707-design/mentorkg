import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["cyrillic", "latin"] });

export const metadata: Metadata = {
  title: "MentorKG — Репетиторы Бишкека",
  description: "Найдите репетитора за 2 минуты",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MentorKG",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.className} bg-gray-100 antialiased`}>
        <div className="min-h-screen bg-gray-100">
          {children}
        </div>
      </body>
    </html>
  );
}