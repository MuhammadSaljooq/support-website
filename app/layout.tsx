import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "AI Agent Solution - Your Intelligent Automation Platform",
    template: "%s | AI Agent Solution",
  },
  description: "Empower your business with intelligent AI agents that automate tasks, enhance productivity, and deliver exceptional results around the clock.",
  keywords: ["AI", "automation", "agents", "productivity", "business automation"],
  authors: [{ name: "AI Agent Solution" }],
  creator: "AI Agent Solution",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aiagent.com",
    siteName: "AI Agent Solution",
    title: "AI Agent Solution - Your Intelligent Automation Platform",
    description: "Empower your business with intelligent AI agents that automate tasks, enhance productivity, and deliver exceptional results.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Agent Solution - Your Intelligent Automation Platform",
    description: "Empower your business with intelligent AI agents that automate tasks, enhance productivity, and deliver exceptional results.",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthSessionProvider>
            {children}
            <Toaster position="top-right" richColors />
          </AuthSessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

