import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import AppSidebar from "@/components/layouts/AppSidebar";
import { SIDEBAR_STORAGE_KEY } from "@/config/storage-keys";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken-grotesk", display: "swap" });

export const metadata: Metadata = {
  title: "360 ONE · Form Prefill",
  description: "Fill nomination forms from identity documents or a batch sheet.",
};

// App shell: sidebar on the left, the page on the right; exactly one screen tall. Only panels inside scroll.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // data-sidebar is set by the script below before anything paints, so a folded sidebar never flashes open.
    <html lang="en" className={hankenGrotesk.variable} data-sidebar="auto" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var s=localStorage.getItem("${SIDEBAR_STORAGE_KEY}");if(s==="collapsed"||s==="open")document.documentElement.dataset.sidebar=s}catch(e){}` }} />
      </head>
      <body className="flex h-screen overflow-hidden">
        <AppSidebar />
        <main className="min-h-0 min-w-0 flex-1">{children}</main>
      </body>
    </html>
  );
}
