import React, { Children } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black">
      {children}
    </main>
  );
}
