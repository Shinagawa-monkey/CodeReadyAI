import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@/services/clerk/components/ClerkProvider";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner"

const outfitSans = Outfit({
  variable: "--font-outfit-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeReadyAI - AI-Powered Interview Preparation Platform",
  description: "Master your technical interviews with AI-powered practice questions, voice mock interviews, and resume analysis. Get personalized feedback and ace your next job interview - completely free!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${outfitSans.variable} antialiased font-sans`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableColorScheme
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}