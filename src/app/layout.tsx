import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-barlow",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Todo Motor Blog — Veículos, Barcos, Aeronaves e Máquinas",
    template: "%s | Todo Motor Blog",
  },
  description:
    "O blog especializado do universo motor brasileiro. Notícias sobre veículos, máquinas agrícolas, terraplenagem, barcos, lanchas, jet ski, aeronaves, drones, lançamentos e eventos do setor.",
  keywords: [
    "blog motor", "veículos pesados", "máquinas agrícolas", "trator", "colheitadeira",
    "lanchas", "barcos", "jet ski", "aeronaves", "drones", "caminhão", "transporte pesado",
    "terraplenagem", "escavadeira", "lançamentos automotivos", "Todo Motor"
  ],
  authors: [{ name: "Todo Motor", url: "https://todomotor.com.br" }],
  creator: "Todo Motor",
  publisher: "Todo Motor",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Todo Motor Blog",
    title: "Todo Motor Blog — Veículos, Barcos, Aeronaves e Máquinas",
    description: "Notícias especializadas do universo motor brasileiro. Lançamentos, eventos, drones, náutica e muito mais.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Todo Motor Blog",
    description: "Notícias especializadas do universo motor brasileiro.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* JSON-LD: Organization structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Todo Motor",
              url: "https://todomotor.com.br",
              logo: "https://todomotor.com.br/logo.png",
              sameAs: [
                "https://www.facebook.com/todomotor",
                "https://www.instagram.com/todomotor",
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${barlow.variable} ${barlowCondensed.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
