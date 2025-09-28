import { Button } from '@leaseup/ui/components/button';
import { Previews } from './_components/previews';
import { Calendar, Rocket } from 'lucide-react';

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
        offers: {
          '@type': 'Offer',
          price: '799.00',
          priceCurrency: 'ZAR',
          priceSpecification: {
            '@type': 'RecurringPaymentsPriceSpecification',
            price: '799.00',
            priceCurrency: 'ZAR',
            billingDuration: 'P1M',
            billingIncrement: 1,
          },
        },
        featureList: [
          'Online rent collection',
          'Automated rent reminders',
          'Tenant management',
          'Lease tracking',
          'Document management',
          'Payment tracking',
          'South African payment methods',
        ],
      },
      {
        '@type': 'Organization',
        name: 'LeaseUp',
        url: 'https://leaseup.co.za',
        logo: 'https://leaseup.co.za/leaseup-logo.svg',
        description:
          'Leading property management software for South African landlords',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'ZA',
        },
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

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main>
        <section className='bg-[#fefefe] text-[#1E293B] pt-20 sm:pt-52 md:min-h-[700px] flex items-center'>
          <div className='max-w-[1392px] mx-auto px-4 md:px-8 w-full'>
            <div className='flex flex-col items-center text-center gap-0 w-full'>
              <div className='max-w-3xl w-full'>
                <h1 className='text-4xl sm:text-5xl md:text-7xl  mb-6 tracking-tight leading-tight font-bold'>
                  Simplify Your{' '}
                  <span className='text-[#1ABC9C]'>Rental Property</span>{' '}
                  Management
                </h1>
                <p className='text-base sm:text-xl text-[#475569] mb-8 tracking-tight leading-relaxed text-pretty max-w-lg mx-auto'>
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
          className='py-20 bg-[#ECF0F1]'
          aria-labelledby='features-heading'
        >
          <div className='max-w-7xl mx-auto px-4 md:px-8'>
            <div className='text-center mb-16'>
              <h2
                id='features-heading'
                className='text-3xl sm:text-4xl font-bold text-[#2C3E50] mb-4'
              >
                Property Management Made Simple
              </h2>
              <p className='text-base sm:text-xl text-[#7F8C8D] max-w-2xl mx-auto text-pretty'>
                Powerful tools designed for South African landlords and property
                managers
              </p>
            </div>

            {/* Features List - alternating layout */}
            <div className='space-y-24'>
              {/* Feature 1 - Rent Collection */}
              <article className='flex flex-col md:flex-row items-center gap-12'>
                <div className='relative w-full md:w-1/2 flex justify-center'>
                  <div className='absolute -z-10 top-6 left-6 w-72 h-72 bg-[#1ABC9C]/20 rounded-full blur-2xl'></div>
                  <img
                    src='/feature-accounting.svg'
                    alt='LeaseUp automated rent collection dashboard showing online invoicing, payment tracking, and financial reports for South African landlords'
                    className='rounded-xl shadow-lg w-full max-w-md'
                    loading='lazy'
                    width='400'
                    height='300'
                  />
                </div>
                <div className='w-full md:w-1/2'>
                  <h3 className='text-2xl font-bold mb-2 text-[#2C3E50]'>
                    Automated Rent Collection
                  </h3>
                  <p className='mb-4 text-[#475569]'>
                    Accept payments online through all major South African
                    payment methods. Send automated invoices and reminders to
                    reduce late payments.
                  </p>
                  <ul className='list-image-none list text-[#2C3E50] mb-2 flex flex-col gap-2 [&>li]:font-bold [&>li]:text-lg [&>li]:tracking-tight'>
                    <li>✅ Online invoicing with automatic reminders</li>
                    <li>✅ WhatsApp, SMS, and email notifications</li>
                    <li>
                      ✅ EFT, credit cards, and bank transfers via Paystack
                    </li>
                    <li>✅ Instant payment notifications</li>
                  </ul>
                  {/* <a
                  href='/features/accounting'
                  className='text-[#1ABC9C] font-medium hover:underline'
                >
                  More &gt;
                </a> */}
                </div>
              </article>

              {/* Feature 2 - Tenant Management */}
              <article className='flex flex-col md:flex-row-reverse items-center gap-12'>
                <div className='relative w-full md:w-1/2 flex justify-center'>
                  <div className='absolute -z-10 top-6 right-6 w-72 h-72 bg-[#1ABC9C]/20 rounded-full blur-2xl'></div>
                  <img
                    src='/feature-leasing.svg'
                    alt='LeaseUp tenant management system showing lease agreements, tenant profiles, and communication tools for property managers'
                    className='rounded-xl shadow-lg w-full max-w-md'
                    loading='lazy'
                    width='400'
                    height='300'
                  />
                </div>
                <div className='w-full md:w-1/2'>
                  <h3 className='text-2xl font-bold mb-2 text-[#2C3E50]'>
                    Tenant & Lease Management
                  </h3>
                  <p className='mb-4 text-[#475569]'>
                    Organize tenant information, track lease agreements, and
                    monitor payment history—all in one centralized platform.
                  </p>
                  <ul className='list-image-none list text-[#2C3E50] mb-2 flex flex-col gap-2 [&>li]:font-bold [&>li]:text-lg [&>li]:tracking-tight'>
                    <li>✅ Secure tenant database with FICA documents</li>
                    <li>✅ Lease tracking with expiry alerts</li>
                    <li>✅ Complete payment history tracking</li>
                    <li>✅ Automated tenant communication</li>
                  </ul>
                  {/* <a
                  href='/features/leasing'
                  className='text-[#1ABC9C] font-medium hover:underline'
                >
                  More &gt;
                </a> */}
                </div>
              </article>

              {/* Feature 3 - Online Rent Collection */}
              <article className='flex flex-col md:flex-row items-center gap-12'>
                <div className='relative w-full md:w-1/2 flex justify-center'>
                  <div className='absolute -z-10 top-6 left-6 w-72 h-72 bg-[#1ABC9C]/20 rounded-full blur-2xl'></div>
                  <img
                    src='/feature-rent-collection.svg'
                    alt='Online rent collection platform showing multiple South African payment methods including EFT, credit cards, and mobile payments'
                    className='rounded-xl shadow-lg w-full max-w-md'
                    loading='lazy'
                    width='400'
                    height='300'
                  />
                </div>
                <div className='w-full md:w-1/2'>
                  <h3 className='text-2xl font-bold mb-2 text-[#2C3E50]'>
                    Online Payment Options
                  </h3>
                  <p className='mb-4 text-[#475569]'>
                    Provide tenants with convenient online payment options
                    through Paystack, supporting all major South African payment
                    methods.
                  </p>
                  <ul className='list-image-none list text-[#2C3E50] mb-2 flex flex-col gap-2 [&>li]:font-bold [&>li]:text-lg [&>li]:tracking-tight'>
                    <li>✅ Credit cards, EFT, and bank transfers</li>
                    <li>
                      ✅ Full payments, partial payments, and installments
                    </li>
                    <li>
                      ✅ Real-time payment tracking with automated follow-ups
                    </li>
                  </ul>
                  {/* <a
                  href='/features/online-rent-collection'
                  className='text-[#1ABC9C] font-medium hover:underline'
                >
                  More &gt;
                </a> */}
                </div>
              </article>

              {/* Feature 4 - Document Management */}
              <article className='flex flex-col md:flex-row-reverse items-center gap-12'>
                <div className='relative w-full md:w-1/2 flex justify-center'>
                  <div className='absolute -z-10 top-6 right-6 w-72 h-72 bg-[#1ABC9C]/20 rounded-full blur-2xl'></div>
                  <img
                    src='/feature-maintenance.svg'
                    alt='Document management system for landlords showing lease agreements, FICA documents, and property records storage'
                    className='rounded-xl shadow-lg w-full max-w-md'
                    loading='lazy'
                    width='400'
                    height='300'
                  />
                </div>
                <div className='w-full md:w-1/2'>
                  <h3 className='text-2xl font-bold mb-2 text-[#2C3E50]'>
                    Document Management
                  </h3>
                  <p className='mb-4 text-[#475569]'>
                    Securely store lease agreements, FICA documents, and
                    property records with automated backups and easy access.
                  </p>
                  <ul className='list-image-none list text-[#2C3E50] mb-2 flex flex-col gap-2 [&>li]:font-bold [&>li]:text-lg [&>li]:tracking-tight'>
                    <li>✅ Secure cloud storage with automated backups</li>
                    <li>
                      ✅ Generate lease agreements and invoices automatically
                    </li>
                    <li>✅ FICA compliance and tenant verification</li>
                  </ul>
                  {/* <a
                  href='/features/maintenance'
                  className='text-[#1ABC9C] font-medium hover:underline'
                >
                  More &gt;
                </a> */}
                </div>
              </article>
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
                className='text-4xl font-bold text-[#2C3E50] mb-4'
              >
                Affordable Property Management Software Pricing
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
              Join South African landlords who trust LeaseUp to manage their
              rental properties efficiently with automated rent collection and
              tenant management.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <a href={SIGNUP_URL ?? ''}>
                <Button
                  size='lg'
                  className='bg-[#1ABC9C] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#16A085] transition-colors flex items-center justify-center gap-2'
                >
                  <Rocket />
                  Get Started
                </Button>
              </a>
              <a href='mailto:awelani@leaseup.co.za'>
                <Button
                  size='lg'
                  className='border-2 border-white/10 text-white px-8 py-4 rounded-lg font-medium hover:bg-white hover:text-[#2C3E50] transition-colors flex items-center justify-center gap-2'
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
