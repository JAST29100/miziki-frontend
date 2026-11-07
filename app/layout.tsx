import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Miziki | Comunidad musical",
  description:
    "Encuentra músicos, comparte tus creaciones y participa en eventos musicales.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}