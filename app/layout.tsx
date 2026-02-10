import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getNeighborhoodsGrouped } from "@/lib/queries";

/* --- Font Loading --- */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

// Codec Pro — self-hosted. Place .woff2 files in /public/fonts/
// When font files are added, uncomment this block:
// const codecPro = localFont({
//   src: [
//     { path: "../public/fonts/CodecPro-Regular.woff2", weight: "400", style: "normal" },
//     { path: "../public/fonts/CodecPro-Bold.woff2", weight: "700", style: "normal" },
//   ],
//   variable: "--font-logo",
//   display: "swap",
// });
// Then add codecPro.variable to the <html> className below
const codecProVariable = ""; // Placeholder until font files are added

/* --- Metadata --- */
export const metadata: Metadata = {
  title: {
    default: "ATL Vibes & Views — The City. The Culture. The Conversation.",
    template: "%s | ATL Vibes & Views",
  },
  description:
    "Discover Atlanta's neighborhoods, businesses, events, and culture. ATL Vibes & Views is your guide to the city.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ATL Vibes & Views",
  },
};

/* --- Root Layout --- */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const exploreData = await getNeighborhoodsGrouped();

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} ${codecProVariable}`}
    >
      <body className="font-body text-black bg-white min-h-screen flex flex-col">
        <Header exploreData={exploreData} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
