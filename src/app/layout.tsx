import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
// @ts-ignore
import "./globals.css";

// Font utama untuk body text - Inter sangat mudah dibaca dan modern
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

// Font untuk headings - Poppins memberikan karakter yang kuat dan menarik
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Bukhari Service Center - Layanan Perbaikan HP Terpercaya",
  description: "Layanan perbaikan handphone profesional, cepat, dan transparan. Kami hadir untuk menghidupkan kembali gadget Anda dengan keahlian terbaik.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
