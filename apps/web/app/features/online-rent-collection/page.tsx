import { Button } from '@leaseup/ui/components/button';
import { Badge } from '@leaseup/ui/components/badge';
import {
  Sparkles,
  Key,
  Shield,
  FileText,
  Bell,
  BarChart3,
  Rocket,
  Check,
  Lock,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { H3 } from '@leaseup/ui/components/typography';
import { Metadata } from 'next/types';

export const metadata: Metadata = {
  title: 'Online Rent Collection | LeaseUp - Get Paid On Time, Every Time',
  description:
    "Simplify your rent collection with LeaseUp's automated online payment system. Secure payments, automatic invoicing, payment reminders, and real-time tracking. Stop chasing rent payments.",
  keywords: [
    'online rent collection',
    'rent payment software',
    'landlord payment system',
    'automated rent collection',
    'tenant payment portal',
    'rental property management',
    'secure rent payments',
    'rent payment tracking',
    'landlord software',
    'property management tools',
  ],
  openGraph: {
    title: 'Online Rent Collection | LeaseUp - Get Paid On Time, Every Time',
    description:
      "Simplify your rent collection with LeaseUp's automated online payment system. Secure payments, automatic invoicing, payment reminders, and real-time tracking.",
    type: 'website',
    url: 'https://leaseup.com/features/online-rent-collection',
    siteName: 'LeaseUp',
    images: [
      {
        url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/e0ece068ae-5630d40fe01b9d56cd91.png',
        width: 1200,
        height: 630,
        alt: 'LeaseUp Online Rent Collection Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Rent Collection | LeaseUp - Get Paid On Time, Every Time',
    description:
      "Simplify your rent collection with LeaseUp's automated online payment system. Secure payments, automatic invoicing, payment reminders, and real-time tracking.",
    images: [
      'https://storage.googleapis.com/uxpilot-auth.appspot.com/e0ece068ae-5630d40fe01b9d56cd91.png',
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://leaseup.com/features/online-rent-collection',
  },
};

export default function OnlineRentCollection() {
  return (
    <div className='min-h-screen'>
      {/* Hero Section */}
      <section
        id='hero'
        className='bg-gradient-to-b from-[#f5faff] to-[#34495E] text-white pt-24 pb-16 h-[650px] to-70% flex items-center'
      >
        <div className='max-w-7xl mx-auto px-4 md:px-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <div>
              <div className='flex items-center gap-2 mb-6'>
                <Badge
                  variant='outline'
                  className='text-[#34495E] font-bold border-[#34495E] text-base'
                >
                  <Sparkles className='text-[#34495E] text-xl font-bold' />
                  Online Rent Collection
                </Badge>
              </div>
              <h1 className='text-5xl md:text-6xl font-bold mb-6 leading-tight'>
                Simplified and
                <span className='text-[#1ABC9C]'> Streamlined</span>
              </h1>
              <h2 className='text-2xl font-bold text-gray-200 mb-6'>
                Get Paid On Time. Every Time.
              </h2>
              <p className='text-xl text-gray-300 mb-8 leading-relaxed'>
                With LeaseUp&apos;s online rent collection, landlords no longer
                have to chase tenants for payments or manually track who&apos;s
                paid. We automate the entire process — from invoicing to
                reminders to receipts.
              </p>
              <Button className='bg-[#1ABC9C] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#16A085] transition-colors flex items-center gap-2'>
                <ArrowRight className='h-4 w-4' />
                Start Collecting Rent Online
              </Button>
            </div>
            <div className='relative'>
              <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20'>
                <img
                  className='w-full h-80 object-cover rounded-xl'
                  src='https://storage.googleapis.com/uxpilot-auth.appspot.com/e0ece068ae-5630d40fe01b9d56cd91.png'
                  alt='modern rent collection dashboard showing payment status, automated reminders, and payment methods'
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section id='key-benefits' className='py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-4 md:px-8'>
          <div className='text-center mb-16'>
            <div className='flex items-center justify-center gap-2 mb-4'>
              <Key className='text-[#3498DB] text-2xl' />
              <h2 className='text-4xl font-bold text-[#2C3E50]'>
                Key Benefits
              </h2>
            </div>
            <p className='text-xl text-[#7F8C8D] max-w-3xl mx-auto'>
              Everything you need to transform your rent collection process
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16'>
            <div id='benefit-secure-payments' className='flex gap-6'>
              <div className='bg-[#3498DB] text-white h-16 w-16 rounded-xl flex items-center justify-center flex-shrink-0'>
                <Shield className='text-2xl' />
              </div>
              <div>
                <h3 className='text-2xl font-bold text-[#2C3E50] mb-4'>
                  Secure Online Payments
                </h3>
                <p className='text-[#7F8C8D] text-lg'>
                  Tenants can pay rent anytime, from anywhere, using trusted,
                  secure payment methods including card, EFT, and bank transfer.
                </p>
              </div>
            </div>

            <div id='benefit-auto-invoicing' className='flex gap-6'>
              <div className='bg-[#2ECC71] text-white h-16 w-16 rounded-xl flex items-center justify-center flex-shrink-0'>
                <FileText className='text-2xl' />
              </div>
              <div>
                <H3 className='mb-4'>Automatic Rent Invoicing</H3>
                <p className='text-[#7F8C8D] text-lg'>
                  Set your billing cycle once — LeaseUp automatically generates
                  and sends invoices to your tenants each month.
                </p>
              </div>
            </div>

            <div id='benefit-reminders' className='flex gap-6'>
              <div className='bg-[#F39C12] text-white h-16 w-16 rounded-xl flex items-center justify-center flex-shrink-0'>
                <Bell className='text-2xl' />
              </div>
              <div>
                <H3 className='mb-4'>Friendly Payment Reminders</H3>
                <p className='text-[#7F8C8D] text-lg'>
                  Our smart reminders notify tenants before rent is due,
                  reducing late payments and awkward conversations.
                </p>
              </div>
            </div>

            <div id='benefit-tracking' className='flex gap-6'>
              <div className='bg-[#1ABC9C] text-white h-16 w-16 rounded-xl flex items-center justify-center flex-shrink-0'>
                <BarChart3 className='text-2xl' />
              </div>
              <div>
                <H3 className='mb-4'>Real-Time Payment Tracking</H3>
                <p className='text-[#7F8C8D] text-lg'>
                  See who&apos;s paid, who hasn&apos;t, and when the next
                  payment is due — all from your dashboard.
                </p>
              </div>
            </div>
          </div>

          <div className='text-center'>
            <Button className='bg-[#2C3E50] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#34495E] transition-colors'>
              <ArrowRight className='h-4 w-4 mr-2' />
              Explore All Features
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id='how-it-works' className='py-20 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 md:px-8'>
          <div className='text-center mb-16'>
            <div className='flex items-center justify-center gap-2 mb-4'>
              <Rocket className='text-[#3498DB] text-2xl' />
              <h2 className='text-4xl font-bold text-[#2C3E50]'>
                How It Works
              </h2>
            </div>
            <p className='text-xl text-[#7F8C8D] max-w-3xl mx-auto'>
              Get started in minutes with our simple 4-step setup process
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16'>
            <div className='text-center'>
              <div className='bg-[#3498DB] text-white h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold'>
                1
              </div>
              <h3 className='text-xl font-bold text-[#2C3E50] mb-4'>
                Connect Your Bank
              </h3>
              <p className='text-[#7F8C8D]'>
                Securely link your bank account in just a few clicks. We use
                bank-level encryption to keep your details safe.
              </p>
            </div>

            <div className='text-center'>
              <div className='bg-[#2ECC71] text-white h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold'>
                2
              </div>
              <h3 className='text-xl font-bold text-[#2C3E50] mb-4'>
                Create Invoices
              </h3>
              <p className='text-[#7F8C8D]'>
                Set up one-time or recurring invoices for each tenant. Choose
                your billing cycle and let us handle the rest.
              </p>
            </div>

            <div className='text-center'>
              <div className='bg-[#F39C12] text-white h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold'>
                3
              </div>
              <h3 className='text-xl font-bold text-[#2C3E50] mb-4'>
                Tenants Pay
              </h3>
              <p className='text-[#7F8C8D]'>
                Tenants receive invoices via email and can pay instantly using
                their preferred payment method.
              </p>
            </div>

            <div className='text-center'>
              <div className='bg-[#1ABC9C] text-white h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold'>
                4
              </div>
              <h3 className='text-xl font-bold text-[#2C3E50] mb-4'>
                You Get Paid
              </h3>
              <p className='text-[#7F8C8D]'>
                Money is transferred directly to your bank account immediately
                after payment. No waiting, no delays.
              </p>
            </div>
          </div>

          <div className='bg-white rounded-2xl p-8 shadow-lg'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
              <div>
                <h3 className='text-3xl font-bold text-[#2C3E50] mb-6'>
                  Instant Payment Processing
                </h3>
                <div className='space-y-4'>
                  <div className='flex items-start gap-4'>
                    <div className='bg-[#2ECC71] text-white h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                      <Check className='text-sm' />
                    </div>
                    <div>
                      <h4 className='font-semibold text-[#2C3E50] mb-1'>
                        Real-Time Notifications
                      </h4>
                      <p className='text-[#7F8C8D]'>
                        Get instant alerts when payments are received
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start gap-4'>
                    <div className='bg-[#2ECC71] text-white h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                      <Check className='text-sm' />
                    </div>
                    <div>
                      <h4 className='font-semibold text-[#2C3E50] mb-1'>
                        Automatic Reconciliation
                      </h4>
                      <p className='text-[#7F8C8D]'>
                        No more manual bank statement matching
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start gap-4'>
                    <div className='bg-[#2ECC71] text-white h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                      <Check className='text-sm' />
                    </div>
                    <div>
                      <h4 className='font-semibold text-[#2C3E50] mb-1'>
                        Multiple Payment Methods
                      </h4>
                      <p className='text-[#7F8C8D]'>
                        Credit cards, bank transfers, and digital wallets
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start gap-4'>
                    <div className='bg-[#2ECC71] text-white h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                      <Check className='text-sm' />
                    </div>
                    <div>
                      <h4 className='font-semibold text-[#2C3E50] mb-1'>
                        24/7 Payment Processing
                      </h4>
                      <p className='text-[#7F8C8D]'>
                        Tenants can pay anytime, anywhere
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className='bg-gradient-to-br from-[#3498DB] to-[#2980B9] rounded-xl p-6 text-white'>
                <div className='text-center'>
                  <Calendar className='h-12 w-12 mx-auto mb-4 text-white' />
                  <h4 className='text-xl font-bold mb-2'>Setup Time</h4>
                  <p className='text-2xl font-bold mb-2'>Under 5 Minutes</p>
                  <p className='text-sm opacity-90'>
                    From signup to first payment
                  </p>
                </div>
                <div className='mt-6 space-y-3'>
                  <div className='flex justify-between items-center'>
                    <span>Bank Connection</span>
                    <span className='font-semibold'>2 min</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span>Invoice Setup</span>
                    <span className='font-semibold'>1 min</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span>Tenant Invitation</span>
                    <span className='font-semibold'>1 min</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span>First Payment</span>
                    <span className='font-semibold'>Instant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Compliance */}
      <section id='trust-compliance' className='py-20 bg-[#2C3E50] text-white'>
        <div className='max-w-7xl mx-auto px-4 md:px-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <div>
              <div className='flex items-center gap-2 mb-6'>
                <Lock className='text-[#1ABC9C] text-2xl' />
                <h2 className='text-4xl font-bold'>
                  Built for Trust & Compliance
                </h2>
              </div>
              <p className='text-xl text-gray-300 mb-8 leading-relaxed'>
                We use secure, PCI-compliant payment gateways like Paystack to
                ensure every transaction is encrypted and traceable. Tenant
                deposits and rental income are safely routed according to local
                laws and best practices.
              </p>
              <div className='flex items-center gap-6'>
                <div className='flex items-center gap-2'>
                  <Shield className='text-[#2ECC71]' />
                  <span className='text-sm'>PCI Compliant</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Lock className='text-[#2ECC71]' />
                  <span className='text-sm'>256-bit Encryption</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge
                    variant='secondary'
                    className='text-[#2ECC71] bg-transparent border-[#2ECC71]'
                  >
                    Bank-Level Security
                  </Badge>
                </div>
              </div>
            </div>
            <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20'>
              <img
                className='w-full h-80 object-cover rounded-xl'
                src='https://storage.googleapis.com/uxpilot-auth.appspot.com/47913214b1-a039d6e7221b9a04f82f.png'
                alt='secure payment processing interface with encryption and compliance badges'
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id='cta-section'
        className='py-20 bg-gradient-to-r from-[#3498DB] to-[#2980B9] text-white'
      >
        <div className='max-w-4xl mx-auto px-4 md:px-8 text-center'>
          <h2 className='text-4xl md:text-5xl font-bold mb-6'>
            Ready to Stop Chasing Rent?
          </h2>
          <p className='text-2xl text-gray-200 mb-8'>
            Join thousands of landlords who have simplified their rent
            collection process
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button
              size='lg'
              className='bg-[#1ABC9C] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#16A085] transition-colors flex items-center gap-2'
            >
              <ArrowRight className='h-4 w-4' />
              Get Started Today
            </Button>
            <Button
              size='lg'
              variant='outlined'
              className='border-white text-black px-8 py-4 rounded-lg font-medium hover:bg-white hover:text-[#3498DB] transition-colors'
            >
              <Calendar className='h-4 w-4' />
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
