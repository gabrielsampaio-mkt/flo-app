import type { Metadata } from "next";
import { Inter, Fredoka } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Flô — Seu cultivo. Sua jornada. Sua comunidade.",
  description: "Plataforma de acompanhamento de cultivos de cannabis para o cultivador brasileiro.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Flô",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${fredoka.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">
          <QueryProvider>{children}</QueryProvider>
        </body>
    </html>
  );
}
