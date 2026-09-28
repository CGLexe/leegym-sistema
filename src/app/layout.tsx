import type { Metadata } from "next";
import { Bebas_Neue, Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LEE GYM | Gimnasio",
  description:
    "Servicios, productos y agenda tu cita en LEE GYM.",
  keywords: ["gimnasio", "fitness", "entrenamiento", "LEE GYM"],
  openGraph: {
    title: "LEE GYM | Gimnasio",
    description: "Agenda tu cita en LEE GYM.",
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es-MX"
      className={`${bebasNeue.variable} ${barlow.variable} ${barlowCondensed.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-lee-black text-lee-white">
        {children}
      </body>
    </html>
  );
}
