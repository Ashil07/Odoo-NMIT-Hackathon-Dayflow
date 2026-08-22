import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono, Public_Sans } from "next/font/google";
import "./globals.css";
import { DayflowProvider } from "@/components/app/store";

// app shell type. unchanged — every screen already references these vars.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// marketing type. display grotesque for headlines, workhorse for prose.
const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const body = Public_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dayflow — one clock for the whole company",
  description:
    "Attendance, leave and payroll on one system of record. HR issues the account, Dayflow does the arithmetic.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <DayflowProvider>{children}</DayflowProvider>
      </body>
    </html>
  );
}
