import { Button } from '@leaseup/ui/components/button';
import { Previews } from './_components/previews';
import { GridPattern } from './_components/grid-pattern';
import { Calendar, Rocket, UserPlus, Building, CreditCard } from 'lucide-react';
import { cn } from '@leaseup/ui/utils/cn';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'LeaseUp - Property Management Software for South African Landlords | Online Rent Collection',
  description:
    'Property management software for South African landlords. Automate rent collection, tenant management, and lease tracking with online payments through Paystack. Start your free trial today.',
  keywords: [
    'property management software South Africa',
    'online rent collection South Africa',
    'landlord software South Africa',
    'tenant management system',
    'lease management software',
    'Paystack rent collection',
    'South African property management',
    'automated rent reminders',
    'property rental software',
    'landlord dashboard South Africa',
    'EFT rent collection',
    'property management Cape Town',
    'property management Johannesburg',
    'property management Durban',
  ],
  openGraph: {
    title: 'LeaseUp - Property Management Software for South African Landlords',
    description:
      "Automate rent collection, manage tenants, and track leases with South Africa's leading property management software. Secure online payments via Paystack.",
    url: 'https://leaseup.co.za',
    siteName: 'LeaseUp',
    images: [
      {
        url: 'https://leaseup.co.za/Screenshot 2025-10-07 at 21.45.13.webp',
        width: 1200,
        height: 630,
        alt: 'LeaseUp Property Management Dashboard - Online Rent Collection for South African Landlords',
      },
    ],
    locale: 'en_ZA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LeaseUp - Property Management Software for South African Landlords',
    description:
      "Automate rent collection, manage tenants, and track leases with South Africa's leading property management software.",
    images: ['https://leaseup.co.za/Screenshot 2025-10-07 at 21.45.13.webp'],
  },
  alternates: {
    canonical: 'https://leaseup.co.za',
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
};

export default function Home() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'LeaseUp',
        description:
          'Property management software for South African landlords. Automate rent collection, tenant management, and lease tracking with online payments through Paystack.',
        url: 'https://leaseup.co.za',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web Browser',
        screenshot:
          'https://leaseup.co.za/Screenshot 2025-10-07 at 21.45.13.webp',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '127',
          bestRating: '5',
          worstRating: '1',
        },
        offers: {
          '@type': 'Offer',
          price: '799.00',
          priceCurrency: 'ZAR',
          availability: 'https://schema.org/InStock',
          priceSpecification: {
            '@type': 'RecurringPaymentsPriceSpecification',
            price: '799.00',
            priceCurrency: 'ZAR',
            billingDuration: 'P1M',
            billingIncrement: 1,
          },
        },
        featureList: [
          'Online rent collection with Paystack integration',
          'Automated rent reminders and notifications',
          'Comprehensive tenant management system',
          'Digital lease tracking and management',
          'Secure document management and storage',
          'Real-time payment tracking and reporting',
          'South African payment methods (EFT, Credit Cards)',
          'WhatsApp and email notifications',
          'FICA document management',
          'Lease expiry alerts',
        ],
        softwareVersion: '2.0',
        releaseNotes:
          'Enhanced South African payment integration and improved tenant management features',
      },
      {
        '@type': 'Organization',
        name: 'LeaseUp',
        url: 'https://leaseup.co.za',
        logo: 'https://leaseup.co.za/leaseup-logo.svg',
        description: 'Property management software for South African landlords',
        foundingDate: '2024',
      },
      {
        '@type': 'LocalBusiness',
        '@id': 'https://leaseup.co.za/#business',
        name: 'LeaseUp Property Management',
        description:
          'Property management software solutions for South African landlords and property managers',
        url: 'https://leaseup.co.za',
        email: 'awelani@leaseup.co.za',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'ZA',
          addressRegion: 'Guateng',
        },
        areaServed: [
          {
            '@type': 'Country',
            name: 'South Africa',
          },
          {
            '@type': 'City',
            name: 'Cape Town',
          },
          {
            '@type': 'City',
            name: 'Johannesburg',
          },
          {
            '@type': 'City',
            name: 'Durban',
          },
        ],
        serviceType: 'Property Management Software',
        priceRange: 'R799/month',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How secure is my data with LeaseUp?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'We use bank-grade security with SSL encryption and secure data centers. Your information is protected with the same level of security used by financial institutions.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I import my existing tenant data?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! You can easily import your existing tenant information, lease agreements, and payment history to get started quickly.',
            },
          },
          {
            '@type': 'Question',
            name: 'What payment methods do tenants have?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Tenants can pay via credit card, debit card, EFT, or bank transfer. We support all major South African payment methods through Paystack.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is there a setup fee or long-term contract?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No setup fees and no long-term contracts. You can cancel anytime. We believe in earning your business every month.',
            },
          },
          {
            '@type': 'Question',
            name: 'How quickly can I get started?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'You can be up and running in under 10 minutes. Add your properties, add tenants and their lease agreements, and start collecting payments.',
            },
          },
          {
            '@type': 'Question',
            name: 'Do you offer customer support?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! We provide email support and comprehensive documentation to help you get the most out of LeaseUp.',
            },
          },
        ],
      },
    ],
  };

  const SIGNUP_URL = process.env.NEXT_PUBLIC_SIGNUP_URL ?? null;

  if (!SIGNUP_URL) {
    throw new Error('Missing SIGNUP_URL');
  }

  const howItWorksSteps = [
    {
      name: 'Complete Onboarding',
      description:
        'Sign up and set up your landlord profile in under 5 minutes. Add your business details, bank details etc and verify your account to get started.',
      icon: UserPlus,
      href: SIGNUP_URL,
    },
    {
      name: 'Add Property and Tenant Information',
      description:
        'Upload your properties and tenant details. Import existing lease agreements and tenant documents to centralize your rental management.',
      icon: Building,
      href: SIGNUP_URL,
    },
    {
      name: 'Start Collecting Rent',
      description:
        'Rental Invoices are automatically sent to tenants. Tenants can pay via EFT, credit card, or bank transfer with automatic tracking.',
      icon: CreditCard,
      href: SIGNUP_URL,
    },
  ];

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main>
        <section className='relative bg-[#fefefe] text-[#1E293B] pt-20 sm:pt-52 md:min-h-[700px] flex items-center overflow-hidden'>
          <GridPattern
            width={30}
            height={30}
            x={-1}
            y={-1}
            strokeDasharray={'4 2'}
            className={cn(
              '[mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]'
            )}
          />
          <div className='relative max-w-[1392px] mx-auto px-4 md:px-8 w-full z-10'>
            <div className='flex flex-col items-center text-center gap-0 w-full'>
              <div className='relative max-w-3xl w-full mb-8 sm:mb-0'>
                <h1 className='text-4xl sm:text-5xl md:text-7xl mb-6 tracking-tight leading-tight font-bold'>
                  Simplify Your{' '}
                  <span className='text-secondary'>Rental Property</span>{' '}
                  Management
                </h1>
                <p className='text-base sm:text-xl text-primary mb-8 tracking-tight leading-relaxed text-pretty max-w-lg mx-auto'>
                  Collect rent online, manage tenants, and grow your property
                  portfolio.
                </p>
                <div className='flex flex-col sm:flex-row gap-4 justify-center w-full'>
                  <a href={SIGNUP_URL ?? ''}>
                    <Button size='lg'>
                      <Rocket />
                      Get Started
                    </Button>
                  </a>
                  <a href='mailto:awelani@leaseup.co.za'>
                    <Button size='lg' color='secondary' variant='outlined'>
                      <Calendar />
                      Schedule Demo
                    </Button>
                  </a>
                </div>
              </div>
              <Previews />
            </div>
          </div>
        </section>

        <section
          id='features'
          className='bg-[#ECF0F1] py-24 sm:py-32'
          aria-labelledby='features-heading'
        >
          <div className='mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8'>
            <h2 className='text-base/7 font-semibold text-secondary'>
              Property Management Made Simple
            </h2>
            <p className='mt-2 max-w-lg text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl'>
              Everything you need to manage your rental properties
            </p>
            <div className='mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2'>
              <div className='flex p-px lg:col-span-4'>
                <div className='w-full overflow-hidden rounded-lg bg-white shadow-sm outline outline-black/5 max-lg:rounded-t-4xl lg:rounded-tl-4xl px-5'>
                  <Image
                    alt='LeaseUp automated rent collection dashboard showing online invoicing, payment tracking, and financial reports for South African landlords'
                    src='/Screenshot 2025-10-07 at 21.45.13.webp'
                    width={800}
                    height={320}
                    className='h-80 object-cover object-left border-b border-r shadow rounded-b-lg w-full'
                  />
                  <div className='p-5'>
                    <h3 className='text-sm/4 font-semibold text-gray-500'>
                      Rent Collection / Online Payments
                    </h3>
                    <p className='mt-2 text-lg font-medium tracking-tight text-gray-900'>
                      Automated rent collection with South African payment
                      methods
                    </p>
                    <p className='mt-2 max-w-lg text-sm/6 text-gray-600'>
                      Provide tenants with convenient online payment options
                      through Paystack, supporting credit cards, EFT, bank
                      transfers, and installment payments with real-time
                      tracking.
                    </p>
                  </div>
                </div>
              </div>
              <div className='flex p-px lg:col-span-2'>
                <div className='w-full overflow-hidden rounded-lg bg-white shadow-sm outline outline-black/5 lg:rounded-tr-4xl'>
                  <Image
                    alt='LeaseUp tenant management system showing lease agreements, tenant profiles, and communication tools for property managers'
                    src='/feature-tenant-management.webp'
                    width={400}
                    height={320}
                    className='h-80 object-cover'
                  />
                  <div className='p-10'>
                    <h3 className='text-sm/4 font-semibold text-gray-500'>
                      Tenant Management
                    </h3>
                    <p className='mt-2 text-lg font-medium tracking-tight text-gray-900'>
                      Organize tenants and lease agreements
                    </p>
                    <p className='mt-2 max-w-lg text-sm/6 text-gray-600'>
                      Secure tenant database with FICA documents, lease tracking
                      with expiry alerts, and complete payment history.
                    </p>
                  </div>
                </div>
              </div>
              <div className='flex p-px lg:col-span-2'>
                <div className='w-full overflow-hidden rounded-lg bg-white shadow-sm outline outline-black/5 lg:rounded-bl-4xl'>
                  <Image
                    alt='Document management system for landlords showing lease agreements, FICA documents, and property records storage'
                    src='/feature-file-management.webp'
                    width={400}
                    height={320}
                    className='h-80 object-cover object-left'
                  />
                  <div className='p-10'>
                    <h3 className='text-sm/4 font-semibold text-gray-500'>
                      Document Management
                    </h3>
                    <p className='mt-2 text-lg font-medium tracking-tight text-gray-900'>
                      Secure cloud storage with automated backups
                    </p>
                    <p className='mt-2 max-w-lg text-sm/6 text-gray-600'>
                      Store lease agreements, FICA documents, and property
                      records with automated backups and easy access.
                    </p>
                  </div>
                </div>
              </div>
              <div className='flex p-px lg:col-span-4'>
                <div className='w-full overflow-hidden rounded-lg bg-white shadow-sm outline outline-black/5 max-lg:rounded-b-4xl lg:rounded-br-4xl px-5'>
                  <Image
                    alt='Online rent collection platform showing multiple South African payment methods including EFT, credit cards, and mobile payments'
                    src='/feature-notification.webp'
                    width={800}
                    height={320}
                    className='h-80 object-contain border-b border-r border-l w-full rounded-b-lg shadow'
                  />
                  <div className='p-5'>
                    <h3 className='text-sm/4 font-semibold text-gray-500'>
                      Smart Reminders
                    </h3>
                    <p className='mt-2 text-lg font-medium tracking-tight text-gray-900'>
                      Reduce late payments with automated reminders
                    </p>
                    <p className='mt-2 max-w-lg text-sm/6 text-gray-600'>
                      Get notified when payments are received and send automated
                      reminders to tenants before rent is due, reducing late
                      payments and awkward conversations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id='how-it-works'
          className='py-24 sm:py-32 bg-white'
          aria-labelledby='how-it-works-heading'
        >
          <div className='mx-auto max-w-7xl px-6 lg:px-8'>
            <div className='mx-auto max-w-2xl lg:text-center'>
              <h2 className='text-base/7 font-semibold text-[#1ABC9C]'>
                Get Started in Minutes
              </h2>
              <p className='mt-2 text-4xl font-semibold tracking-tight text-pretty text-primary sm:text-5xl lg:text-balance'>
                How LeaseUp Works for Landlords
              </p>
              <p className='mt-6 text-lg/8'>
                From setup to rent collection, LeaseUp streamlines your entire
                rental property management process. Get up and running with
                automated rent collection in three simple steps.
              </p>
            </div>
            <div className='mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none'>
              <dl className='grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3'>
                {howItWorksSteps.map((step) => (
                  <div key={step.name} className='flex flex-col'>
                    <dt className='flex items-center gap-x-3 text-base/7 font-semibold text-gray-900'>
                      <step.icon
                        aria-hidden='true'
                        className='size-5 flex-none text-[#1ABC9C]'
                      />
                      {step.name}
                    </dt>
                    <dd className='mt-4 flex flex-auto flex-col text-base/7 text-gray-600'>
                      <p className='flex-auto'>{step.description}</p>
                      <p className='mt-6'>
                        <a
                          href={step.href}
                          className='text-sm/6 font-semibold text-[#1ABC9C] hover:text-[#16A085]'
                        >
                          Get started <span aria-hidden='true'>→</span>
                        </a>
                      </p>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section
          id='pricing'
          className='py-20 bg-white'
          aria-labelledby='pricing-heading'
        >
          <div className='max-w-7xl mx-auto px-4 md:px-8'>
            <div className='text-center mb-16'>
              <h2
                id='pricing-heading'
                className='text-4xl font-bold text-primary mb-4'
              >
                Affordable Pricing
              </h2>
              <p className='text-xl text-[#7F8C8D] max-w-2xl mx-auto text-pretty'>
                Transparent pricing for South African landlords. One affordable
                monthly plan covers unlimited rental properties and tenants.
              </p>
            </div>

            <div className='flex justify-center max-w-5xl mx-auto'>
              {[
                {
                  name: 'Professional',
                  price: 'R799.00',
                  features: [
                    'Send Rent Invoices Online',
                    'Automated Rent Reminders',
                    'Online Rent Collection',
                    'Tenant & Lease Management',
                    'Automatic Payment Tracking',
                    'Smart Lease Document Generator',
                    'Downloadable Lease PDFs',
                    'Bank-Grade Security',
                    'Unlimited Tenants & Properties',
                    'Email Notifications',
                    'Whatsapp Notifications',
                  ],
                  popular: false,
                },
              ].map((plan, index) => (
                <div
                  key={index}
                  className={`${plan.popular ? 'bg-[#3498DB] text-white' : 'bg-[#F8FAFC]'} rounded-2xl p-8 ${!plan.popular ? 'border border-gray-200' : ''} relative`}
                >
                  {plan.popular && (
                    <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                      <span className='bg-[#1ABC9C] text-white px-4 py-1 rounded-full text-sm font-medium'>
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className='text-center mb-8'>
                    <h3
                      className={`text-2xl font-bold ${plan.popular ? '' : 'text-[#2C3E50]'} mb-2`}
                    >
                      {plan.name}
                    </h3>
                    <div
                      className={`text-4xl font-bold ${plan.popular ? '' : 'text-[#3498DB]'} mb-2`}
                    >
                      {plan.price}
                    </div>
                    <div
                      className={
                        plan.popular ? 'text-blue-200' : 'text-[#7F8C8D]'
                      }
                    >
                      per month
                    </div>
                    <div
                      className={`text-sm mt-2 ${
                        plan.popular ? 'text-blue-200' : 'text-[#95A5A6]'
                      }`}
                    >
                      + 2.9% transaction fee on rent payments
                    </div>
                  </div>
                  <ul className='space-y-4 mb-8'>
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className='flex items-center gap-3'
                      >
                        <i
                          className={`fa-solid fa-check ${plan.popular ? 'text-[#1ABC9C]' : 'text-[#2ECC71]'}`}
                        ></i>
                        <span className={plan.popular ? '' : 'text-[#2C3E50]'}>
                          ✅ {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${plan.popular ? 'bg-white text-[#3498DB] hover:bg-gray-100' : 'bg-[#3498DB] text-white hover:bg-[#2980B9]'} rounded-lg font-medium transition-colors`}
                  >
                    <Rocket />
                    {plan.name === 'Enterprise'
                      ? 'Contact Sales'
                      : 'Get Started'}
                  </Button>
                </div>
              ))}
            </div>

            {/* Transaction Fee Explanation */}
            <div className='mt-12 max-w-4xl mx-auto'>
              <div className='bg-[#F8FAFC] border border-gray-200 rounded-xl p-6'>
                <div className='flex items-start gap-4'>
                  <div className='flex-shrink-0'>
                    <i className='fa-solid fa-info-circle text-[#3498DB] text-xl'></i>
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold text-[#2C3E50] mb-2'>
                      Transparent Payment Processing
                    </h3>
                    <p className='text-[#7F8C8D] mb-3'>
                      We use Paystack, Africa&apos;s most trusted payment
                      processor, to handle all rent payments securely. The 2.9%
                      transaction fee is charged directly by Paystack.
                    </p>
                    <p className='text-[#7F8C8D] text-sm'>
                      <strong>Example:</strong> On a R5,000 rent payment, the
                      transaction fee would be R145, which is automatically
                      deducted before the payment reaches your account. This
                      industry-standard rate is competitive with other payment
                      processors and ensures your tenants can pay securely
                      online.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id='faq'
          className='py-20 bg-[#ECF0F1]'
          aria-labelledby='faq-heading'
          itemScope
          itemType='https://schema.org/FAQPage'
        >
          <div className='max-w-4xl mx-auto px-4 md:px-8'>
            <div className='text-center mb-16'>
              <h2
                id='faq-heading'
                className='text-4xl font-bold text-[#2C3E50] mb-4'
              >
                Frequently Asked Questions About LeaseUp Property Management
              </h2>
              <p className='text-xl text-[#7F8C8D]'>
                Common questions about our South African property management
                software
              </p>
            </div>

            <div className='space-y-6'>
              {[
                {
                  question: 'How secure is my data with LeaseUp?',
                  answer:
                    'We use bank-grade security with SSL encryption and secure data centers. Your information is protected with the same level of security used by financial institutions.',
                },
                {
                  question: 'Can I import my existing tenant data?',
                  answer:
                    'Yes! You can easily import your existing tenant information, lease agreements, and payment history to get started quickly.',
                },
                {
                  question: 'What payment methods do tenants have?',
                  answer:
                    'Tenants can pay via credit card, debit card, EFT, or bank transfer. We support all major South African payment methods through Paystack, with a standard 2.9% transaction fee that covers secure processing and fraud protection.',
                },
                {
                  question: 'What are the transaction fees for rent payments?',
                  answer:
                    'We charge a transparent 2.9% transaction fee on all rent payments, which is processed by Paystack. This industry-standard rate includes bank-grade security, instant processing, fraud protection, and support for all major payment methods. For example, on a R10,000 rent payment, the fee would be R290.',
                },
                {
                  question: 'Is there a setup fee or long-term contract?',
                  answer:
                    'No setup fees and no long-term contracts. You can cancel anytime. We believe in earning your business every month.',
                },
                {
                  question: 'How quickly can I get started?',
                  answer:
                    'You can be up and running in under 10 minutes. Add your properties, add tenants and their lease agreements, and start collecting payments.',
                },
                {
                  question: 'Do you offer customer support?',
                  answer:
                    'Yes! We provide email support and comprehensive documentation to help you get the most out of LeaseUp.',
                },
              ].map((faq, index) => (
                <div
                  key={index}
                  className='bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300'
                  itemScope
                  itemProp='mainEntity'
                  itemType='https://schema.org/Question'
                >
                  <h3
                    className='text-lg font-semibold text-[#2C3E50] mb-3'
                    itemProp='name'
                  >
                    {faq.question}
                  </h3>
                  <div
                    itemScope
                    itemProp='acceptedAnswer'
                    itemType='https://schema.org/Answer'
                  >
                    <p
                      className='text-[#7F8C8D] leading-relaxed'
                      itemProp='text'
                    >
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className='py-20 bg-gradient-to-r from-[#3498DB] to-[#2C3E50] text-white'>
          <div className='max-w-4xl mx-auto px-4 md:px-8 text-center'>
            <h2 className='text-4xl md:text-5xl font-bold mb-6'>
              Ready to Streamline Your Rental Business?
            </h2>
            <p className='text-xl text-blue-100 mb-8'>
              Join landlords who trust LeaseUp to manage their rental properties
              efficiently with automated rent collection and tenant management.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <a href={SIGNUP_URL ?? ''}>
                <Button
                  size='lg'
                  className='bg-[#1ABC9C] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#16A085] transition-colors flex items-center justify-center gap-2 w-full sm:w-auto'
                >
                  <Rocket />
                  Get Started
                </Button>
              </a>
              <a href='mailto:awelani@leaseup.co.za'>
                <Button
                  size='lg'
                  className='border-2 border-white/10 text-white px-8 py-4 rounded-lg font-medium hover:bg-white hover:text-[#2C3E50] transition-colors flex items-center justify-center gap-2 w-full sm:w-auto'
                >
                  <Calendar />
                  Schedule Demo
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
