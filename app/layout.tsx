import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

// ✅ ตั้งค่าฟอนต์ Kanit ให้พร้อมใช้งาน
const kanit = Kanit({ 
  subsets: ["thai", "latin"], 
  weight: ["300", "400", "700"],
  variable: '--font-kanit',
});

export const metadata: Metadata = {
  title: "MyStore | ร้านค้าออนไลน์",
  description: "ช้อปปิ้งสินค้าคุณภาพราคาถูก",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      {/* ✅ ใช้ฟอนต์ผ่าน className */}
      <body className={`${kanit.className} antialiased`}>
        <Toaster position="top-center" />
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="py-10 border-t text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} MyStore. All rights reserved.
        </footer>
      </body>
    </html>
  );
}