import { Button } from '@leaseup/ui/components/button';
import { Previews } from './_components/previews';
import {
  ArrowRight,
  Banknote,
  Building,
  Calendar,
  ChartLine,
  FolderCheck,
  Play,
  Rocket,
  Users,
  Wrench,
} from 'lucide-react';
import { cn } from '../../../packages/ui/src/utils/cn';
import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <section className='bg-[#fefefe] text-[#1E293B] pt-40 sm:pt-52 min-h-[700px] flex items-center'>
        <div className='max-w-[1392px] mx-auto px-4 md:px-8 w-full'>
          <div className='flex flex-col items-center text-center gap-0 w-full'>
            <div className='max-w-3xl w-full'>
              <h1 className='text-3xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight leading-tight'>
                Simplify Your
                <span className='text-[#1ABC9C]'> Rental </span>
                Management
              </h1>
              <p className='text-base sm:text-xl text-[#475569] mb-8 tracking-tight leading-relaxed'>
                Dead simple platform for landlords to manage their properties,
                tenants, collection rent, manage documentation and more.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center w-full'>
                <Button size='lg'>
                  <Rocket />
                  Start Free Trial
                </Button>
                <Button size='lg'>
                  <Play />
                  Watch Demo
                </Button>
              </div>
            </div>
            <Previews />
          </div>
        </div>
      </section>

      <section id='features' className='py-20 bg-[#ECF0F1]'>
        <div className='max-w-7xl mx-auto px-4 md:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl sm:text-4xl font-bold text-[#2C3E50] mb-4'>
              Everything You Need to Manage Properties
            </h2>
            <p className='text-base sm:text-xl text-[#7F8C8D] max-w-2xl mx-auto'>
              Streamline your rental business with powerful tools designed for
              modern landlords
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {/* Feature cards */}
            {[
              {
                icon: <Banknote />,
                color: '#1ABC9C',
                title: 'Rent Collection',
                description:
                  'Automate rent collection with online payments, late fee tracking, and payment reminders.',
                link: '/features/online-rent-collection',
              },
              {
                icon: <Building />,
                color: '#3498DB',
                title: 'Property Management',
                description:
                  'Organize all your properties in one place. Track units, amenities, and property details with ease.',
                link: '/features/property-management',
              },
              {
                icon: <Users />,
                color: '#2ECC71',
                title: 'Tenant Management',
                description:
                  'Store tenant information, lease agreements, and communication history in one secure location.',
                link: '/features/tenant-management',
              },
              {
                icon: <FolderCheck />,
                color: '#E74C3C',
                title: 'Document Management',
                description:
                  'Store and manage all your property and tenant documents in one secure location.',
                link: '/features/document-management',
              },
              {
                icon: <Wrench />,
                color: '#F39C12',
                title: 'Maintenance Requests',
                description:
                  'Handle maintenance requests efficiently with photo uploads, priority levels, and contractor management.',
                link: '/features/maintenance-requests',
              },
              {
                icon: <ChartLine />,
                color: '#9B59B6',
                title: 'Financial Reports',
                description:
                  'Generate detailed financial reports for tax season and track your rental income performance.',
                link: '/features/financial-reports',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className='bg-white rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-shadow flex flex-col items-center'
              >
                <div
                  className={cn(
                    `h-14 w-14 sm:h-16 sm:w-16 rounded-xl flex items-center justify-center mb-6`
                  )}
                  style={{ background: feature.color + '20' }}
                >
                  {feature.icon}
                </div>
                <h3 className='text-lg sm:text-xl font-bold text-[#2C3E50] mb-2 sm:mb-4'>
                  {feature.title}
                </h3>
                <p className='text-[#7F8C8D] leading-relaxed text-sm sm:text-base'>
                  {feature.description}
                </p>
                <div className='mt-4'>
                  <Link href={feature.link}>
                    <Button
                      variant='outlined'
                      size='sm'
                      className='text-[#7F8C8D] border-[#7F8C8D] hover:bg-[#7F8C8D] hover:text-white'
                    >
                      <ArrowRight />
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id='pricing' className='py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-4 md:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-[#2C3E50] mb-4'>
              Simple, Transparent Pricing
            </h2>
            <p className='text-xl text-[#7F8C8D]'>
              Choose the plan that fits your portfolio size
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
                </div>
                <ul className='space-y-4 mb-8'>
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className='flex items-center gap-3'>
                      <i
                        className={`fa-solid fa-check ${plan.popular ? 'text-[#1ABC9C]' : 'text-[#2ECC71]'}`}
                      ></i>
                      <span className={plan.popular ? '' : 'text-[#2C3E50]'}>
                        {feature}
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
                    : 'Start Free Trial'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id='reviews' className='py-20 bg-[#ECF0F1]'>
        <div className='max-w-7xl mx-auto px-4 md:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-[#2C3E50] mb-4'>
              What Our Customers Say
            </h2>
            <p className='text-xl text-[#7F8C8D]'>
              Join thousands of satisfied landlords
            </p>
          </div>

          <div className='relative'>
            {/* Main Testimonial */}
            <div className='bg-white rounded-3xl p-12 shadow-2xl mb-12 relative overflow-hidden'>
              <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#3498DB]/10 to-[#1ABC9C]/10 rounded-full -translate-y-16 translate-x-16'></div>
              <div className='absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#F39C12]/10 to-[#E74C3C]/10 rounded-full translate-y-12 -translate-x-12'></div>

              <div className='relative z-10'>
                <div className='flex items-center gap-1 mb-8'>
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className='fa-solid fa-star text-[#F39C12] text-2xl'
                    ></i>
                  ))}
                </div>

                <blockquote className='text-2xl text-[#2C3E50] leading-relaxed mb-8 font-bold'>
                  "Rentwise has completely transformed how I manage my 12 rental
                  properties. The automated rent collection alone saves me hours
                  every month, and the maintenance request system is absolutely
                  brilliant."
                </blockquote>

                <div className='flex items-center gap-6'>
                  <img
                    src='https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg'
                    alt='Sarah Johnson'
                    className='w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-lg'
                    width={80}
                    height={80}
                  />
                  <div>
                    <div className='font-bold text-[#2C3E50] text-xl'>
                      Sarah Johnson
                    </div>
                    <div className='text-[#7F8C8D] font-medium'>
                      Property Owner • 12 Properties
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Testimonials Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              <div className='bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-[#2ECC71]'>
                <div className='flex items-center gap-1 mb-4'>
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className='fa-solid fa-star text-[#F39C12]'></i>
                  ))}
                </div>
                <p className='text-[#7F8C8D] mb-6 leading-relaxed'>
                  "The maintenance request system is a game-changer. Tenants
                  love how easy it is to submit requests, and I can track
                  everything efficiently."
                </p>
                <div className='flex items-center gap-4'>
                  <img
                    src='https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg'
                    alt='Mike Chen'
                    className='w-12 h-12 rounded-xl object-cover'
                    width={48}
                    height={48}
                  />
                  <div>
                    <div className='font-semibold text-[#2C3E50]'>
                      Mike Chen
                    </div>
                    <div className='text-sm text-[#7F8C8D]'>
                      Real Estate Investor
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-[#3498DB]'>
                <div className='flex items-center gap-1 mb-4'>
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className='fa-solid fa-star text-[#F39C12]'></i>
                  ))}
                </div>
                <p className='text-[#7F8C8D] mb-6 leading-relaxed'>
                  "As a first-time landlord, Rentwise made everything so much
                  easier. The financial reports help me stay organized for tax
                  season."
                </p>
                <div className='flex items-center gap-4'>
                  <img
                    src='https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg'
                    alt='Emily Rodriguez'
                    className='w-12 h-12 rounded-xl object-cover'
                    width={48}
                    height={48}
                  />
                  <div>
                    <div className='font-semibold text-[#2C3E50]'>
                      Emily Rodriguez
                    </div>
                    <div className='text-sm text-[#7F8C8D]'>New Landlord</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className='mt-16 bg-white rounded-2xl p-8 shadow-lg'>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
                <div className='text-center'>
                  <div className='text-4xl font-bold text-[#3498DB] mb-2'>
                    10,000+
                  </div>
                  <div className='text-[#7F8C8D] font-medium'>
                    Happy Customers
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-4xl font-bold text-[#2ECC71] mb-2'>
                    4.9/5
                  </div>
                  <div className='text-[#7F8C8D] font-medium'>
                    Average Rating
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-4xl font-bold text-[#F39C12] mb-2'>
                    50,000+
                  </div>
                  <div className='text-[#7F8C8D] font-medium'>
                    Properties Managed
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-4xl font-bold text-[#E74C3C] mb-2'>
                    99.9%
                  </div>
                  <div className='text-[#7F8C8D] font-medium'>Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='py-20 bg-gradient-to-r from-[#3498DB] to-[#2C3E50] text-white'>
        <div className='max-w-4xl mx-auto px-4 md:px-8 text-center'>
          <h2 className='text-4xl md:text-5xl font-bold mb-6'>
            Ready to Streamline Your Rental Business?
          </h2>
          <p className='text-xl text-blue-100 mb-8'>
            Join thousands of landlords who trust Rentwise to manage their
            properties efficiently.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button
              size='lg'
              className='bg-[#1ABC9C] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#16A085] transition-colors flex items-center justify-center gap-2'
            >
              <Rocket />
              Start Your Free Trial
            </Button>
            <Button
              size='lg'
              className='border-2 border-white/10 text-white px-8 py-4 rounded-lg font-medium hover:bg-white hover:text-[#2C3E50] transition-colors flex items-center justify-center gap-2'
            >
              <Calendar />
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
