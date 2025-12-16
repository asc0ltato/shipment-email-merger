import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: 'Shipment email merger',
    description: 'Manage your email-group emails',
    icons: {
        icon: '/favicon.svg'
    },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <html lang="ru" suppressHydrationWarning>
        <body className={`${inter.className} bg-slate-100`} suppressHydrationWarning>
        {children}
        </body>
        </html>
    );
}