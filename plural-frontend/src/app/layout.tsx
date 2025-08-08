// Arquivo: src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import  LayoutManager from "@/components/LayoutManager";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <AuthProvider>
          <LayoutManager>{children}</LayoutManager>
        </AuthProvider>
      </body>
    </html>
  );
}