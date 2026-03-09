import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NavigationWrapper } from "@/components/navigation-wrapper";

const roboto = Roboto({
  weight: ["400", "700"],
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://alfareza.site"
  ),
  title: {
    template: "%s | Alfareza",
    default: "Alfareza",
  },
  description: "Personal portfolio of Alfareza, a Software Engineering (RPL) student focused on building modern web applications.",
  openGraph: {
    images: ["/og-image.jpg"], // Placeholder URL
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.jpg"], // Placeholder URL
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${roboto.variable} font-sans antialiased selection:bg-purple-500/30 min-h-screen bg-background text-foreground leading-relaxed`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <div className="fixed inset-0 z-[-1] h-full w-full bg-[#0a0a0a] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          {/* Dual Glow Background */}
          <div className="absolute top-0 z-[-1] w-full h-full flex justify-between overflow-hidden opacity-50">
            <div className="w-[500px] h-[400px] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
            <div className="w-[500px] h-[400px] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />
          </div>

          <NavigationWrapper>
            {children}
          </NavigationWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
