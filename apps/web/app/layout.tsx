import type { Metadata } from "next";
import { Albert_Sans } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leaseup - Property Management Made Simple",
  description: "The all-in-one platform for landlords to manage properties, tenants, rent collection, and maintenance requests effortlessly.",
};

const albertSans = Albert_Sans({
  subsets: ["latin"],
  weight: ["300", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className={albertSans.className}>
        {children}
      </body>
    </html>
  );
}
