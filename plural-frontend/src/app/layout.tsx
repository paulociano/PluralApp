// Arquivo: src/app/layout.tsx
import type { Metadata } from "next";
import { Manrope, Lora } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import  LayoutManager from "@/components/LayoutManager";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

export const metadata: Metadata = {
  title: "Plural",
  description: "Plataforma de Debates Estruturados",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={lora.className}>
        <AuthProvider>
          <LayoutManager>{children}</LayoutManager>
        </AuthProvider>
      </body>
    </html>
  );
}