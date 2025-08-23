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
import { Metadata } from 'next/types';

export const metadata: Metadata = {
  title: 'Online Rent Collection | LeaseUp - Get Paid On Time, Every Time',
  description:
    "Simplify your rent collection with LeaseUp's automated online payment system. Secure payments, automatic invoicing, payment reminders, and real-time tracking. Stop chasing rent payments",
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
    url: 'https://leaseup.co.za/features/online-rent-collection',
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
    canonical: 'https://leaseup.co.za/features/online-rent-collection',
  },
};

export default function OnlineRentCollection() {
  return (
    <div className='min-h-screen'>
      {/* Hero Section */}
      <section
        id='hero'
        className='bg-gray-100 text-gray-900 pt-20 sm:pt-32 md:min-h-[700px] flex items-center'
      >
        <div className='max-w-[1392px] mx-auto px-4 md:px-8 w-full'>
          <div className='flex flex-col items-center text-center gap-0 w-full'>
            <div className='max-w-4xl w-full'>
              <div className='flex items-center justify-center gap-2 mb-6'>
                <Badge
                  variant='outlined'
                  className='text-[#34495E] font-bold border-[#34495E] text-base'
                >
                  <Sparkles className='text-[#34495E] text-xl font-bold' />
                  Online Rent Collection
                </Badge>
              </div>
              <h1 className='text-4xl sm:text-5xl md:text-7xl mb-6 tracking-tight leading-tight font-black'>
                Simplified and
                <span className='text-[#1ABC9C]'> Streamlined</span>
              </h1>
              <h2 className='text-xl sm:text-2xl font-bold text-gray-600 mb-6 tracking-tight'>
                Get Paid On Time. Every Time.
              </h2>
              <p className='text-base sm:text-xl text-gray-700 mb-8 tracking-tight leading-relaxed text-pretty max-w-3xl mx-auto'>
                With LeaseUp&apos;s online rent collection, landlords no longer
                have to chase tenants for payments or manually track who&apos;s
                paid. We automate the entire process — from invoicing to
                reminders to receipts.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center w-full'>
                <Button
                  size='lg'
                  className='bg-[#1ABC9C] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#16A085] transition-colors flex items-center gap-2'
                >
                  <ArrowRight className='h-4 w-4' />
                  Start Collecting Rent Online
                </Button>
              </div>
            </div>
            <div className='relative w-full max-w-5xl mt-8 sm:mt-12'>
              <div className='bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200 shadow-lg'>
                <img
                  className='w-full h-48 sm:h-64 md:h-72 lg:h-80 object-cover rounded-xl'
                  src='https://storage.googleapis.com/uxpilot-auth.appspot.com/e0ece068ae-5630d40fe01b9d56cd91.png'
                  alt='modern rent collection dashboard showing payment status, automated reminders, and payment methods'
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section id='key-benefits' className='py-12 sm:py-16 lg:py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-4 md:px-8'>
          <div className='text-center mb-12 sm:mb-16'>
            <div className='flex items-center justify-center gap-2 mb-4'>
              <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C3E50] tracking-tight'>
                Key Benefits
              </h2>
            </div>
            <p className='text-base sm:text-lg lg:text-xl text-[#7F8C8D] max-w-3xl mx-auto'>
              Everything you need to transform your rent collection process
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-12 sm:mb-16'>
            <div
              id='benefit-secure-payments'
              className='flex flex-col sm:flex-row gap-4 sm:gap-6'
            >
              <div className='bg-[#3498DB] text-white h-12 w-12 sm:h-16 sm:w-16 rounded-xl flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0'>
                <Shield className='text-lg sm:text-2xl' />
              </div>
              <div className='text-center sm:text-left'>
                <h3 className='text-lg sm:text-xl lg:text-2xl font-bold text-[#2C3E50] mb-3 sm:mb-4 tracking-tight'>
                  Secure Online Payments
                </h3>
                <p className='text-[#7F8C8D] text-sm sm:text-base lg:text-lg'>
                  Tenants can pay rent anytime, from anywhere, using trusted,
                  secure payment methods including card, EFT, and bank transfer.
                </p>
              </div>
            </div>

            <div
              id='benefit-auto-invoicing'
              className='flex flex-col sm:flex-row gap-4 sm:gap-6'
            >
              <div className='bg-[#2ECC71] text-white h-12 w-12 sm:h-16 sm:w-16 rounded-xl flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0'>
                <FileText className='text-lg sm:text-2xl' />
              </div>
              <div className='text-center sm:text-left'>
                <h3 className='text-lg sm:text-xl lg:text-2xl font-bold text-[#2C3E50] mb-3 sm:mb-4 tracking-tight'>
                  Automatic Rent Invoicing
                </h3>
                <p className='text-[#7F8C8D] text-sm sm:text-base lg:text-lg'>
                  Set your billing cycle once — LeaseUp automatically generates
                  and sends invoices to your tenants each month.
                </p>
              </div>
            </div>

            <div
              id='benefit-reminders'
              className='flex flex-col sm:flex-row gap-4 sm:gap-6'
            >
              <div className='bg-[#F39C12] text-white h-12 w-12 sm:h-16 sm:w-16 rounded-xl flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0'>
                <Bell className='text-lg sm:text-2xl' />
              </div>
              <div className='text-center sm:text-left'>
                <h3 className='text-lg sm:text-xl lg:text-2xl font-bold text-[#2C3E50] mb-3 sm:mb-4 tracking-tight'>
                  Friendly Payment Reminders
                </h3>
                <p className='text-[#7F8C8D] text-sm sm:text-base lg:text-lg'>
                  Our smart reminders notify tenants before rent is due,
                  reducing late payments and awkward conversations.
                </p>
              </div>
            </div>

            <div
              id='benefit-tracking'
              className='flex flex-col sm:flex-row gap-4 sm:gap-6'
            >
              <div className='bg-[#1ABC9C] text-white h-12 w-12 sm:h-16 sm:w-16 rounded-xl flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0'>
                <BarChart3 className='text-lg sm:text-2xl' />
              </div>
              <div className='text-center sm:text-left'>
                <h3 className='text-lg sm:text-xl lg:text-2xl font-bold text-[#2C3E50] mb-3 sm:mb-4 tracking-tight'>
                  Real-Time Payment Tracking
                </h3>
                <p className='text-[#7F8C8D] text-sm sm:text-base lg:text-lg'>
                  See who&apos;s paid, who hasn&apos;t, and when the next
                  payment is due — all from your dashboard.
                </p>
              </div>
            </div>
          </div>

          <div className='text-center'>
            <Button
              size='lg'
              className='bg-[#2C3E50] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium hover:bg-[#34495E] transition-colors w-full sm:w-auto'
            >
              <ArrowRight className='h-4 w-4 mr-2' />
              Explore All Features
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id='how-it-works' className='py-12 sm:py-16 lg:py-20 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 md:px-8'>
          <div className='text-center mb-12 sm:mb-16'>
            <div className='flex items-center justify-center gap-2 mb-4'>
              <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C3E50] tracking-tight'>
                How It Works
              </h2>
            </div>
            <p className='text-base sm:text-lg lg:text-xl text-[#7F8C8D] max-w-3xl mx-auto'>
              Get started in minutes with our simple 4-step setup process
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16'>
            <div className='text-center px-4'>
              <div className='bg-[#3498DB] text-white h-12 w-12 sm:h-16 sm:w-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-lg sm:text-2xl font-bold'>
                1
              </div>
              <h3 className='text-lg sm:text-xl font-bold text-[#2C3E50] mb-3 sm:mb-4 tracking-tight'>
                Connect Your Bank
              </h3>
              <p className='text-sm sm:text-base text-[#7F8C8D]'>
                Securely link your bank account in just a few clicks. We use
                bank-level encryption to keep your details safe.
              </p>
            </div>

            <div className='text-center px-4'>
              <div className='bg-[#2ECC71] text-white h-12 w-12 sm:h-16 sm:w-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-lg sm:text-2xl font-bold'>
                2
              </div>
              <h3 className='text-lg sm:text-xl font-bold text-[#2C3E50] mb-3 sm:mb-4 tracking-tight'>
                Create Invoices
              </h3>
              <p className='text-sm sm:text-base text-[#7F8C8D]'>
                Set up one-time or recurring invoices for each tenant. Choose
                your billing cycle and let us handle the rest.
              </p>
            </div>

            <div className='text-center px-4'>
              <div className='bg-[#F39C12] text-white h-12 w-12 sm:h-16 sm:w-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-lg sm:text-2xl font-bold'>
                3
              </div>
              <h3 className='text-lg sm:text-xl font-bold text-[#2C3E50] mb-3 sm:mb-4 tracking-tight'>
                Tenants Pay
              </h3>
              <p className='text-sm sm:text-base text-[#7F8C8D]'>
                Tenants receive invoices via email and can pay instantly using
                their preferred payment method.
              </p>
            </div>

            <div className='text-center px-4'>
              <div className='bg-[#1ABC9C] text-white h-12 w-12 sm:h-16 sm:w-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-lg sm:text-2xl font-bold'>
                4
              </div>
              <h3 className='text-lg sm:text-xl font-bold text-[#2C3E50] mb-3 sm:mb-4 tracking-tight'>
                You Get Paid
              </h3>
              <p className='text-sm sm:text-base text-[#7F8C8D]'>
                Money is transferred directly to your bank account immediately
                after payment. No waiting, no delays.
              </p>
            </div>
          </div>

          <div className='bg-white rounded-2xl p-6 sm:p-8 shadow-lg'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center'>
              <div className='order-2 lg:order-1'>
                <h3 className='text-xl sm:text-2xl lg:text-3xl font-bold text-[#2C3E50] mb-4 sm:mb-6 tracking-tight'>
                  Instant Payment Processing
                </h3>
                <div className='space-y-3 sm:space-y-4'>
                  <div className='flex items-start gap-3 sm:gap-4'>
                    <div className='bg-[#2ECC71] text-white h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                      <Check className='text-xs sm:text-sm' />
                    </div>
                    <div>
                      <h4 className='text-sm sm:text-base font-semibold text-[#2C3E50] mb-1 tracking-tight'>
                        Real-Time Notifications
                      </h4>
                      <p className='text-xs sm:text-sm text-[#7F8C8D]'>
                        Get instant alerts when payments are received
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3 sm:gap-4'>
                    <div className='bg-[#2ECC71] text-white h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                      <Check className='text-xs sm:text-sm' />
                    </div>
                    <div>
                      <h4 className='text-sm sm:text-base font-semibold text-[#2C3E50] mb-1 tracking-tight'>
                        Automatic Reconciliation
                      </h4>
                      <p className='text-xs sm:text-sm text-[#7F8C8D]'>
                        No more manual bank statement matching
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3 sm:gap-4'>
                    <div className='bg-[#2ECC71] text-white h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                      <Check className='text-xs sm:text-sm' />
                    </div>
                    <div>
                      <h4 className='text-sm sm:text-base font-semibold text-[#2C3E50] mb-1 tracking-tight'>
                        Multiple Payment Methods
                      </h4>
                      <p className='text-xs sm:text-sm text-[#7F8C8D]'>
                        Credit cards, bank transfers, and digital wallets
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3 sm:gap-4'>
                    <div className='bg-[#2ECC71] text-white h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                      <Check className='text-xs sm:text-sm' />
                    </div>
                    <div>
                      <h4 className='text-sm sm:text-base font-semibold text-[#2C3E50] mb-1 tracking-tight'>
                        24/7 Payment Processing
                      </h4>
                      <p className='text-xs sm:text-sm text-[#7F8C8D]'>
                        Tenants can pay anytime, anywhere
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className='bg-gradient-to-br from-[#3498DB] to-[#2980B9] rounded-xl p-4 sm:p-6 text-white order-1 lg:order-2'>
                <div className='text-center'>
                  <Calendar className='h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-white' />
                  <h4 className='text-lg sm:text-xl font-bold mb-2 tracking-tight'>
                    Setup Time
                  </h4>
                  <p className='text-xl sm:text-2xl font-bold mb-2'>
                    Under 5 Minutes
                  </p>
                  <p className='text-xs sm:text-sm opacity-90'>
                    From signup to first payment
                  </p>
                </div>
                <div className='mt-4 sm:mt-6 space-y-2 sm:space-y-3'>
                  <div className='flex justify-between items-center text-sm sm:text-base'>
                    <span>Bank Connection</span>
                    <span className='font-semibold'>2 min</span>
                  </div>
                  <div className='flex justify-between items-center text-sm sm:text-base'>
                    <span>Invoice Setup</span>
                    <span className='font-semibold'>1 min</span>
                  </div>
                  <div className='flex justify-between items-center text-sm sm:text-base'>
                    <span>Tenant Invitation</span>
                    <span className='font-semibold'>1 min</span>
                  </div>
                  <div className='flex justify-between items-center text-sm sm:text-base'>
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
      <section
        id='trust-compliance'
        className='py-12 sm:py-16 lg:py-20 bg-[#2C3E50] text-white'
      >
        <div className='max-w-7xl mx-auto px-4 md:px-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center'>
            <div className='text-center lg:text-left'>
              <div className='flex items-center justify-center lg:justify-start gap-2 mb-4 sm:mb-6'>
                <Lock className='text-[#1ABC9C] text-xl sm:text-2xl' />
                <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight'>
                  Built for Trust & Compliance
                </h2>
              </div>
              <p className='text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0'>
                We use secure, PCI-compliant payment gateways like Paystack to
                ensure every transaction is encrypted and traceable. Tenant
                deposits and rental income are safely routed according to local
                laws and best practices.
              </p>
              <div className='flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 lg:gap-3 xl:gap-6'>
                <div className='flex items-center gap-2'>
                  <Shield className='text-[#2ECC71] text-sm sm:text-base' />
                  <span className='text-xs sm:text-sm'>PCI Compliant</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Lock className='text-[#2ECC71] text-sm sm:text-base' />
                  <span className='text-xs sm:text-sm'>256-bit Encryption</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge
                    variant='outlined'
                    className='text-[#2ECC71] bg-transparent border-[#2ECC71] text-xs sm:text-sm px-2 py-1'
                  >
                    Bank-Level Security
                  </Badge>
                </div>
              </div>
            </div>
            <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20'>
              <img
                className='w-full h-48 sm:h-64 lg:h-80 object-cover rounded-xl'
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
        className='py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-[#3498DB] to-[#2980B9] text-white'
      >
        <div className='max-w-4xl mx-auto px-4 md:px-8 text-center'>
          <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight tracking-tight'>
            Ready to Stop Chasing Rent?
          </h2>
          <p className='text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-6 sm:mb-8 max-w-3xl mx-auto'>
            Join thousands of landlords who have simplified their rent
            collection process
          </p>
          <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-lg mx-auto'>
            <Button
              size='lg'
              className='bg-[#1ABC9C] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium hover:bg-[#16A085] transition-colors flex items-center justify-center gap-2 w-full sm:w-auto'
            >
              <ArrowRight className='h-4 w-4' />
              Get Started Today
            </Button>
            <Button
              size='lg'
              variant='outlined'
              className='border-2 border-white text-white bg-transparent px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium hover:bg-white hover:text-[#3498DB] transition-colors flex items-center justify-center gap-2 w-full sm:w-auto'
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
