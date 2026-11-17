import type { Metadata } from "next";
import "./globals.css";

import { ActiveUserProvider } from "@/contexts/ActiveUserContext";

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
      <body>
        <ActiveUserProvider>
          {children}
        </ActiveUserProvider>
      </body>
    </html>
  );
}
