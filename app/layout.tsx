import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deal AI Finder 🇨🇱 — Ofertas Imperdibles en Chile",
  description:
    "Buscador de ofertas increíbles, bugs de precio y descuentos extremos en tiendas chilenas. Precios en pesos chilenos (CLP).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}
