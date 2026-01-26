import type { Metadata } from "next";
import { NavbarDemo } from "@/components/layout/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import { StockProvider } from "@/context/StockContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "TradeHub - Real-time Stock Trading",
  description: "Real-time stock trading dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-linear-to-br from-gray-950 via-gray-900 to-gray-950">
        <AuthProvider>
          <StockProvider>
            <NavbarDemo />
            <div className="pt-30">
              {children}
            </div>
          </StockProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
