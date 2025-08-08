// Arquivo: src/app/(auth)/layout.tsx
import ParticlesBackground from "@/components/ParticlesBackground";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ParticlesBackground />
      <div className="flex items-center justify-center min-h-screen">
        {children}
      </div>
    </>
  );
}