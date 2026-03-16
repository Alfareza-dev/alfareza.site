import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const roboto = Roboto({
  weight: ["400", "700"],
  variable: "--font-roboto",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#050a0c",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://alfareza.site"
  ),
  title: {
    template: "%s | Alfareza",
    default: "Personal Portfolio | Alfareza",
  },
  description: "A passionate Software Engineering (RPL) student specializing in building high-performance web applications, modern UI/UX design, and integrated security systems.",
  keywords: ["Alfareza", "Security Center", "Honeypot", "Portfolio", "Web Security", "Next.js", "Software Engineering", "React"],
  openGraph: {
    title: "Sites | Alfareza",
    description: "Explore the projects and technical journey of Alfareza, a high school student focused on modern Software Engineering.",
    images: ["/opengraph-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image.png"],
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
        className={`${roboto.variable} font-sans antialiased selection:bg-teal-500/30 min-h-screen flex flex-col bg-background text-foreground leading-relaxed`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          {children}
          <Toaster theme="dark" position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
