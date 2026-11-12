import type { Metadata } from "next";
import { NeonProviders } from "./neon-providers";
import "@neondatabase/auth-ui/css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ponto Líder",
  description: "Gestão interna de ponto do Bar Líder",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><NeonProviders>{children}</NeonProviders></body></html>;
}
