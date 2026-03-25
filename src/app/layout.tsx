import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bl4ckJ4ck — Crypto Casino",
  description: "Play blackjack with crypto. Decentralized, fair, beautiful.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-casino-black text-white antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#161a1e",
              color: "#fff",
              border: "1px solid #252b31",
              borderRadius: "12px",
              fontSize: "13px",
            },
            success: {
              iconTheme: { primary: "#d4af37", secondary: "#161a1e" },
            },
            error: {
              iconTheme: { primary: "#e74c3c", secondary: "#161a1e" },
            },
          }}
        />
      </body>
    </html>
  );
}
