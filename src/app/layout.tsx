import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Cadence — Content Calendar Planner",
  description: "Plan 30 days of social content for every client in seconds.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast:
                "!rounded-xl !border !border-line !bg-surface !text-ink !shadow-lg !font-sans",
              description: "!text-ink-2",
            },
          }}
        />
      </body>
    </html>
  );
}
