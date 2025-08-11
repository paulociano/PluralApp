// Arquivo: src/app/layout.tsx
import type { Metadata } from "next";
import { Manrope, Lora } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { HeaderProvider } from "@/context/HeaderContext";
import LayoutManager from "@/components/LayoutManager";
import { Toaster } from 'react-hot-toast';

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
    <html lang="pt-br">
      <body className={` bg-gray-50`}>
        <AuthProvider>
          <HeaderProvider>
             <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
            <LayoutManager>{children}</LayoutManager>
          </HeaderProvider>
        </AuthProvider>
      </body>
    </html>
  );
}