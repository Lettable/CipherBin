import { Kanit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Head from "next/head";

const kanit = Kanit({
  subsets: ["latin"],
  variable: "--font-kanit",
  weight: ["400", "700"],
});

export const metadata = {
  title: "CipherBin",
  description:
    "CipherBin is a secure, offline-enabled pastebin for sharing code and text privately. Enjoy a sleek, modern experience built with Next.js and Space Mono. With robust performance and a user-friendly interface, CipherBin is perfect for developers and anyone who values privacy and simplicity.",
  author: "Mirza",
  keywords:
    "CipherBin, Secure Pastebin, Offline Paste, Privacy, Code Sharing, Next.js, Space Mono, Secure Text Editor, Developer Tools",
  openGraph: {
    title: "CipherBin - Secure Offline Pastebin",
    description:
      "Share code and text privately with CipherBin – a secure and offline-enabled pastebin built for modern developers.",
    type: "website",
    images: [
      {
        url: "https://your-domain.com/icon.png",
        width: 1200,
        height: 630,
        alt: "CipherBin - Secure Offline Pastebin",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CipherBin - Secure Offline Pastebin",
    description:
      "A secure, offline-enabled pastebin for sharing code and text privately. Experience modern privacy with CipherBin.",
    images: ["https://your-domain.com/icon.png"],
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/icon.png" />
      </Head>
      <body className={`${kanit.className} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
