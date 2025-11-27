import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Subway Surfers Video Generator",
  description: "Generate engaging videos with Subway Surfers background and TTS narration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
