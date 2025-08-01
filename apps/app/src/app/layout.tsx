import "@leaseup/ui/global.css";

import { Inter } from "next/font/google";
import { AuthWrapper } from "./_components/auth-wrapper";

const font = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${font.className} bg-gray-50 antialiased`}>
        <AuthWrapper>{children}</AuthWrapper>
      </body>
    </html>
  );
}
