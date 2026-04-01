import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Vòng Quay May Mắn | Lucky Spin",
  description: "Quay vòng quay may mắn để nhận ưu đãi hấp dẫn!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
