import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import Header from "@/components/Header";

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
          <Header /> {/* <-- ADICIONE O HEADER AQUI */}
          <main>{children}</main> {/* Envolvemos o children com <main> para semântica */}
        </AuthProvider>
      </body>
    </html>
  );
}