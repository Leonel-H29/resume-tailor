import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResumeTailor AI — Craft Your Perfect Resume",
  description:
    "AI-powered resume optimizer that tailors your resume to any job description. ATS-friendly, keyword-optimized, and ready to download.",
  keywords: ["resume", "AI", "ATS", "job application", "resume optimizer"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
