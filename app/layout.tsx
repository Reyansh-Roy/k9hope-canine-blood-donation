import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import { useEffect } from "react";
import { UserProvider, useUser } from "@/context/UserContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "K9Hope - Canine Blood Donation Network",
  description: "India's AI-Powered Canine Blood Donation Network - RIT Chennai x Madras Veterinary College",
  applicationName: "K9Hope",
  authors: [{ name: "RIT Chennai CSE Department" }],
  openGraph: {
    title: "K9Hope - Canine Blood Donation Network",
    type: "website",
    url: "https://k9hope.in",
    siteName: "K9Hope Veterinary Network",
  },
};

// Component to update device type


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserProvider>
      <SettingsProvider>
        <html lang="en" suppressHydrationWarning>
          <head>
            <link rel="icon" href="/k9hope-paw-icon.svg" />
            <link rel="apple-touch-icon" href="/k9hope-logo-192.png" />
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"></meta>
          </head>

          <body className={inter.className}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >

              {children}
            </ThemeProvider>
            <Toaster />
          </body>
        </html>
      </SettingsProvider>
    </UserProvider>
  );
}
