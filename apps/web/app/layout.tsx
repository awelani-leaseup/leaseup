import './index.css';

import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';

import { Header } from './_components/header';
import { Footer } from './_components/footer';

export const metadata: Metadata = {
  title: 'Leaseup - Property Management Made Simple',
  description:
    'The all-in-one platform for landlords to manage properties, tenants, rent collection, and maintenance requests effortlessly.',
  keywords: [
    'property management',
    'landlord software',
    'online rent collection',
    'tenant management',
    'lease management',
    'real estate',
    'maintenance requests',
    'property rental',
    'accounting',
    'document management',
    'property dashboard',
    'Leaseup',
  ],
  authors: [{ name: 'Leaseup', url: 'https://leaseup.co.za' }],
  creator: 'Leaseup',
  openGraph: {
    title: 'Leaseup - Property Management Made Simple',
    description:
      'The all-in-one platform for landlords to manage properties, tenants, rent collection, and maintenance requests effortlessly.',
    url: 'https://leaseup.co.za',
    siteName: 'Leaseup',
    images: [
      {
        url: 'https://leaseup.co.za/leaseup-logo.svg',
        width: 1200,
        height: 630,
        alt: 'Leaseup Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Leaseup - Property Management Made Simple',
    description:
      'The all-in-one platform for landlords to manage properties, tenants, rent collection, and maintenance requests effortlessly.',
    site: '@leaseup',
    creator: '@leaseup',
    images: ['https://leaseup.com/leaseup-logo.svg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  metadataBase: new URL('https://leaseup.co.za'),
  alternates: {
    canonical: 'https://leaseup.co.za',
  },
};

const onest = DM_Sans({
  subsets: ['latin'],
  weight: ['400'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        <script
          src='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js'
          crossOrigin='anonymous'
          referrerPolicy='no-referrer'
        />
      </head>
      <body className={onest.className + ' antialiased'}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
