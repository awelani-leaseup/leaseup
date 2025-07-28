import { Button } from '@leaseup/ui/components/button';
import { Badge } from '@leaseup/ui/components/badge';
import {
  FileText,
  FolderOpen,
  Shield,
  Search,
  Cloud,
  Share2,
  Lock,
  ArrowRight,
  Check,
  Download,
  Eye,
  Archive,
  Clock,
  Users,
} from 'lucide-react';
import { Metadata } from 'next/types';

export const metadata: Metadata = {
  title:
    'Document Management | LeaseUp - Organize & Secure All Property Documents',
  description:
    "Centralize all your property documents with LeaseUp's secure document management system. Store leases, contracts, inspections, and tenant files in one organized, searchable platform.",
  keywords: [
    'document management',
    'property document storage',
    'lease document management',
    'tenant file organization',
    'property management documents',
    'secure document storage',
    'rental property files',
    'digital document management',
    'landlord document system',
    'property record keeping',
  ],
  openGraph: {
    title:
      'Document Management | LeaseUp - Organize & Secure All Property Documents',
    description:
      "Centralize all your property documents with LeaseUp's secure document management system. Store leases, contracts, inspections, and tenant files in one organized platform.",
    type: 'website',
    url: 'https://leaseup.com/features/document-management',
    siteName: 'LeaseUp',
    images: [
      {
        url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/document-management-dashboard.png',
        width: 1200,
        height: 630,
        alt: 'LeaseUp Document Management Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Document Management | LeaseUp - Organize & Secure All Property Documents',
    description:
      "Centralize all your property documents with LeaseUp's secure document management system. Store leases, contracts, inspections, and tenant files in one organized platform.",
    images: [
      'https://storage.googleapis.com/uxpilot-auth.appspot.com/document-management-dashboard.png',
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
    canonical: 'https://leaseup.com/features/document-management',
  },
};

export default function DocumentManagement() {
  return (
    <div className='min-h-screen'>
      {/* Hero Section */}
      <section
        id='hero'
        className='bg-gray-100 text-[#2C3E50] pt-20 sm:pt-32 md:min-h-[700px] flex items-center'
      >
        <div className='max-w-[1392px] mx-auto px-4 md:px-8 w-full'>
          <div className='flex flex-col items-center text-center gap-0 w-full'>
            <div className='max-w-4xl w-full'>
              <div className='flex items-center justify-center gap-2 mb-6'>
                <Badge
                  variant='outlined'
                  className='text-[#34495E] font-bold border-[#34495E] text-base'
                >
                  <FolderOpen className='text-[#34495E] text-xl font-bold' />
                  Document Management
                </Badge>
              </div>
              <h1 className='text-4xl sm:text-5xl md:text-7xl mb-6 tracking-tight leading-tight font-black'>
                Organize and
                <span className='text-[#1ABC9C]'> Secure</span>
              </h1>
              <h2 className='text-xl sm:text-2xl font-bold text-gray-600 mb-6'>
                All Your Property Documents in One Place
              </h2>
              <p className='text-base sm:text-xl text-gray-600 mb-8 tracking-tight leading-relaxed text-pretty max-w-3xl mx-auto'>
                Stop digging through filing cabinets and email attachments.
                LeaseUp&apos;s document management system centralizes all your
                leases, contracts, inspections, and tenant files in one secure,
                searchable platform.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center w-full'>
                <Button
                  size='lg'
                  className='bg-[#1ABC9C] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#16A085] transition-colors flex items-center gap-2'
                >
                  <ArrowRight className='h-4 w-4' />
                  Start Organizing Documents
                </Button>
              </div>
            </div>
            <div className='relative w-full max-w-5xl mt-8 sm:mt-12'>
              <div className='bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200 shadow-lg'>
                <img
                  className='w-full h-48 sm:h-64 md:h-72 lg:h-80 object-cover rounded-xl'
                  src='https://storage.googleapis.com/uxpilot-auth.appspot.com/document-management-dashboard.png'
                  alt='modern document management dashboard showing organized folders, search functionality, and secure file sharing'
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
              <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C3E50]'>
                Key Benefits
              </h2>
            </div>
            <p className='text-base sm:text-lg lg:text-xl text-[#7F8C8D] max-w-3xl mx-auto'>
              Everything you need to manage property documents efficiently and
              securely
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-12 sm:mb-16'>
            <div
              id='benefit-centralized-storage'
              className='flex flex-col sm:flex-row gap-4 sm:gap-6'
            >
              <div className='bg-[#3498DB] text-white h-12 w-12 sm:h-16 sm:w-16 rounded-xl flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0'>
                <Cloud className='text-lg sm:text-2xl' />
              </div>
              <div className='text-center sm:text-left'>
                <h3 className='text-lg sm:text-xl lg:text-2xl font-bold text-[#2C3E50] mb-3 sm:mb-4 tracking-tight'>
                  Centralized Storage
                </h3>
                <p className='text-[#7F8C8D] text-sm sm:text-base lg:text-lg'>
                  Store all property documents in one secure cloud platform.
                  Access leases, contracts, and tenant files from anywhere,
                  anytime.
                </p>
              </div>
            </div>

            <div
              id='benefit-smart-search'
              className='flex flex-col sm:flex-row gap-4 sm:gap-6'
            >
              <div className='bg-[#2ECC71] text-white h-12 w-12 sm:h-16 sm:w-16 rounded-xl flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0'>
                <Search className='text-lg sm:text-2xl' />
              </div>
              <div className='text-center sm:text-left'>
                <h3 className='text-lg sm:text-xl lg:text-2xl font-bold text-[#2C3E50] mb-3 sm:mb-4 tracking-tight'>
                  Smart Search & Filter
                </h3>
                <p className='text-[#7F8C8D] text-sm sm:text-base lg:text-lg'>
                  Find any document instantly with powerful search
                  functionality. Filter by property, tenant, document type, or
                  date range.
                </p>
              </div>
            </div>

            <div
              id='benefit-secure-sharing'
              className='flex flex-col sm:flex-row gap-4 sm:gap-6'
            >
              <div className='bg-[#F39C12] text-white h-12 w-12 sm:h-16 sm:w-16 rounded-xl flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0'>
                <Share2 className='text-lg sm:text-2xl' />
              </div>
              <div className='text-center sm:text-left'>
                <h3 className='text-lg sm:text-xl lg:text-2xl font-bold text-[#2C3E50] mb-3 sm:mb-4 tracking-tight'>
                  Secure Document Sharing
                </h3>
                <p className='text-[#7F8C8D] text-sm sm:text-base lg:text-lg'>
                  Share documents securely with tenants, contractors, or legal
                  teams. Control who can view, download, or edit each document.
                </p>
              </div>
            </div>

            <div
              id='benefit-automated-organization'
              className='flex flex-col sm:flex-row gap-4 sm:gap-6'
            >
              <div className='bg-[#1ABC9C] text-white h-12 w-12 sm:h-16 sm:w-16 rounded-xl flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0'>
                <Archive className='text-lg sm:text-2xl' />
              </div>
              <div className='text-center sm:text-left'>
                <h3 className='text-lg sm:text-xl lg:text-2xl font-bold text-[#2C3E50] mb-3 sm:mb-4 tracking-tight'>
                  Automated Organization
                </h3>
                <p className='text-[#7F8C8D] text-sm sm:text-base lg:text-lg'>
                  Documents are automatically categorized and organized by
                  property, tenant, and document type for easy navigation.
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

      {/* Document Types */}
      <section
        id='document-types'
        className='py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 via-white to-gray-100'
      >
        <div className='max-w-7xl mx-auto px-4 md:px-8'>
          <div className='text-center mb-12 sm:mb-16'>
            <div className='flex items-center justify-center gap-2 mb-6'>
              <div className='bg-gradient-to-r from-[#3498DB] to-[#2980B9] p-2 rounded-xl'>
                <FolderOpen className='text-white text-xl sm:text-2xl' />
              </div>
              <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C3E50]'>
                Document Types We Support
              </h2>
            </div>
            <p className='text-base sm:text-lg lg:text-xl text-[#7F8C8D] max-w-3xl mx-auto mb-4'>
              Organize all your property management documents in dedicated
              categories
            </p>
            <div className='w-24 h-1 bg-gradient-to-r from-[#3498DB] to-[#1ABC9C] mx-auto rounded-full'></div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16'>
            {/* Lease Agreements */}
            <div className='group bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-[#3498DB]/20 relative overflow-hidden'>
              <div className='absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#3498DB]/10 to-transparent rounded-bl-2xl'></div>
              <div className='relative'>
                <div className='bg-gradient-to-br from-[#3498DB] to-[#2980B9] text-white h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg'>
                  <FileText className='text-xl sm:text-2xl' />
                </div>
                <h3 className='text-lg sm:text-xl font-bold text-[#2C3E50] mb-3 group-hover:text-[#3498DB] transition-colors'>
                  Lease Agreements
                </h3>
                <p className='text-[#7F8C8D] text-sm sm:text-base mb-4 leading-relaxed'>
                  Store and manage all lease agreements, renewals, and
                  amendments
                </p>
              </div>
            </div>

            {/* Tenant Files */}
            <div className='group bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-[#2ECC71]/20 relative overflow-hidden'>
              <div className='absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#2ECC71]/10 to-transparent rounded-bl-2xl'></div>
              <div className='relative'>
                <div className='bg-gradient-to-br from-[#2ECC71] to-[#27AE60] text-white h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg'>
                  <Users className='text-xl sm:text-2xl' />
                </div>
                <h3 className='text-lg sm:text-xl font-bold text-[#2C3E50] mb-3 group-hover:text-[#2ECC71] transition-colors'>
                  Tenant Files
                </h3>
                <p className='text-[#7F8C8D] text-sm sm:text-base mb-4 leading-relaxed'>
                  Comprehensive tenant documentation and application materials
                </p>
              </div>
            </div>

            {/* Inspection Reports */}
            <div className='group bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-[#F39C12]/20 relative overflow-hidden'>
              <div className='absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#F39C12]/10 to-transparent rounded-bl-2xl'></div>
              <div className='relative'>
                <div className='bg-gradient-to-br from-[#F39C12] to-[#E67E22] text-white h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg'>
                  <Eye className='text-xl sm:text-2xl' />
                </div>
                <h3 className='text-lg sm:text-xl font-bold text-[#2C3E50] mb-3 group-hover:text-[#F39C12] transition-colors'>
                  Inspection Reports
                </h3>
                <p className='text-[#7F8C8D] text-sm sm:text-base mb-4 leading-relaxed'>
                  Document property conditions and inspection findings
                </p>
              </div>
            </div>

            {/* Legal Documents */}
            <div className='group bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-[#1ABC9C]/20 relative overflow-hidden'>
              <div className='absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#1ABC9C]/10 to-transparent rounded-bl-2xl'></div>
              <div className='relative'>
                <div className='bg-gradient-to-br from-[#1ABC9C] to-[#16A085] text-white h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg'>
                  <Shield className='text-xl sm:text-2xl' />
                </div>
                <h3 className='text-lg sm:text-xl font-bold text-[#2C3E50] mb-3 group-hover:text-[#1ABC9C] transition-colors'>
                  Legal Documents
                </h3>
                <p className='text-[#7F8C8D] text-sm sm:text-base mb-4 leading-relaxed'>
                  Legal notices, evictions, and compliance documentation
                </p>
              </div>
            </div>

            {/* Maintenance Records */}
            <div className='group bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-[#E74C3C]/20 relative overflow-hidden'>
              <div className='absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#E74C3C]/10 to-transparent rounded-bl-2xl'></div>
              <div className='relative'>
                <div className='bg-gradient-to-br from-[#E74C3C] to-[#C0392B] text-white h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg'>
                  <Clock className='text-xl sm:text-2xl' />
                </div>
                <h3 className='text-lg sm:text-xl font-bold text-[#2C3E50] mb-3 group-hover:text-[#E74C3C] transition-colors'>
                  Maintenance Records
                </h3>
                <p className='text-[#7F8C8D] text-sm sm:text-base mb-4 leading-relaxed'>
                  Track all maintenance work, repairs, and vendor invoices
                </p>
              </div>
            </div>

            {/* Financial Records */}
            <div className='group bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-[#9B59B6]/20 relative overflow-hidden'>
              <div className='absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#9B59B6]/10 to-transparent rounded-bl-2xl'></div>
              <div className='relative'>
                <div className='bg-gradient-to-br from-[#9B59B6] to-[#8E44AD] text-white h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg'>
                  <FileText className='text-xl sm:text-2xl' />
                </div>
                <h3 className='text-lg sm:text-xl font-bold text-[#2C3E50] mb-3 group-hover:text-[#9B59B6] transition-colors'>
                  Financial Records
                </h3>
                <p className='text-[#7F8C8D] text-sm sm:text-base mb-4 leading-relaxed'>
                  Financial documents, receipts, and tax-related paperwork
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className='bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] rounded-2xl p-8 sm:p-12 text-center border border-gray-200'>
            <div className='max-w-4xl mx-auto'>
              <div className='flex items-center justify-center gap-3 mb-6'>
                <div className='bg-gradient-to-r from-[#1ABC9C] to-[#16A085] p-3 rounded-xl'>
                  <Archive className='text-white text-2xl' />
                </div>
                <h3 className='text-2xl sm:text-3xl font-bold text-[#2C3E50]'>
                  And Much More
                </h3>
              </div>
              <p className='text-[#7F8C8D] text-base sm:text-lg mb-6 leading-relaxed'>
                Our flexible document management system supports any file type
                you need. From property photos and floor plans to insurance
                policies and warranty documents - organize everything in one
                secure location.
              </p>
              <div className='flex flex-wrap justify-center gap-3 sm:gap-4'>
                <Badge
                  variant='outlined'
                  className='bg-white/50 border-[#3498DB] text-[#3498DB] px-4 py-2'
                >
                  Property Photos
                </Badge>
                <Badge
                  variant='outlined'
                  className='bg-white/50 border-[#2ECC71] text-[#2ECC71] px-4 py-2'
                >
                  Floor Plans
                </Badge>
                <Badge
                  variant='outlined'
                  className='bg-white/50 border-[#F39C12] text-[#F39C12] px-4 py-2'
                >
                  Insurance Policies
                </Badge>
                <Badge
                  variant='outlined'
                  className='bg-white/50 border-[#1ABC9C] text-[#1ABC9C] px-4 py-2'
                >
                  Warranty Documents
                </Badge>
                <Badge
                  variant='outlined'
                  className='bg-white/50 border-[#E74C3C] text-[#E74C3C] px-4 py-2'
                >
                  Certificates
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id='how-it-works' className='py-12 sm:py-16 lg:py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-4 md:px-8'>
          <div className='text-center mb-12 sm:mb-16'>
            <div className='flex items-center justify-center gap-2 mb-4'>
              <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C3E50] tracking-tight'>
                How It Works
              </h2>
            </div>
            <p className='text-base sm:text-lg lg:text-xl text-[#7F8C8D] max-w-3xl mx-auto'>
              Get your documents organized in just a few simple steps
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16'>
            <div className='text-center px-4'>
              <div className='bg-[#3498DB] text-white h-12 w-12 sm:h-16 sm:w-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-lg sm:text-2xl font-bold'>
                1
              </div>
              <h3 className='text-lg sm:text-xl font-bold text-[#2C3E50] mb-3 sm:mb-4 tracking-tight'>
                Upload Documents
              </h3>
              <p className='text-sm sm:text-base text-[#7F8C8D]'>
                Drag and drop files or upload from your device. Supports PDFs,
                images, and common document formats.
              </p>
            </div>

            <div className='text-center px-4'>
              <div className='bg-[#2ECC71] text-white h-12 w-12 sm:h-16 sm:w-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-lg sm:text-2xl font-bold'>
                2
              </div>
              <h3 className='text-lg sm:text-xl font-bold text-[#2C3E50] mb-3 sm:mb-4'>
                Auto-Categorize
              </h3>
              <p className='text-sm sm:text-base text-[#7F8C8D]'>
                Our system automatically categorizes documents by type and
                organizes them by property and tenant.
              </p>
            </div>

            <div className='text-center px-4'>
              <div className='bg-[#F39C12] text-white h-12 w-12 sm:h-16 sm:w-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-lg sm:text-2xl font-bold'>
                3
              </div>
              <h3 className='text-lg sm:text-xl font-bold text-[#2C3E50] mb-3 sm:mb-4'>
                Search & Access
              </h3>
              <p className='text-sm sm:text-base text-[#7F8C8D]'>
                Find any document instantly using our powerful search. Access
                from any device, anywhere.
              </p>
            </div>

            <div className='text-center px-4'>
              <div className='bg-[#1ABC9C] text-white h-12 w-12 sm:h-16 sm:w-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-lg sm:text-2xl font-bold'>
                4
              </div>
              <h3 className='text-lg sm:text-xl font-bold text-[#2C3E50] mb-3 sm:mb-4'>
                Share Securely
              </h3>
              <p className='text-sm sm:text-base text-[#7F8C8D]'>
                Share documents with tenants, contractors, or legal teams with
                customizable access permissions.
              </p>
            </div>
          </div>

          <div className='bg-gray-50 rounded-2xl p-6 sm:p-8 shadow-lg'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center'>
              <div className='order-2 lg:order-1'>
                <h3 className='text-xl sm:text-2xl lg:text-3xl font-bold text-[#2C3E50] mb-4 sm:mb-6'>
                  Advanced Document Features
                </h3>
                <div className='space-y-3 sm:space-y-4'>
                  <div className='flex items-start gap-3 sm:gap-4'>
                    <div className='bg-[#2ECC71] text-white h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                      <Check className='text-xs sm:text-sm' />
                    </div>
                    <div>
                      <h4 className='text-sm sm:text-base font-semibold text-[#2C3E50] mb-1 tracking-tight'>
                        Version Control
                      </h4>
                      <p className='text-xs sm:text-sm text-[#7F8C8D]'>
                        Track document versions and maintain revision history
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3 sm:gap-4'>
                    <div className='bg-[#2ECC71] text-white h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                      <Check className='text-xs sm:text-sm' />
                    </div>
                    <div>
                      <h4 className='text-sm sm:text-base font-semibold text-[#2C3E50] mb-1 tracking-tight'>
                        OCR Text Recognition
                      </h4>
                      <p className='text-xs sm:text-sm text-[#7F8C8D]'>
                        Search inside PDF and image documents
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3 sm:gap-4'>
                    <div className='bg-[#2ECC71] text-white h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                      <Check className='text-xs sm:text-sm' />
                    </div>
                    <div>
                      <h4 className='text-sm sm:text-base font-semibold text-[#2C3E50] mb-1 tracking-tight'>
                        Bulk Operations
                      </h4>
                      <p className='text-xs sm:text-sm text-[#7F8C8D]'>
                        Upload, organize, and share multiple documents at once
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3 sm:gap-4'>
                    <div className='bg-[#2ECC71] text-white h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                      <Check className='text-xs sm:text-sm' />
                    </div>
                    <div>
                      <h4 className='text-sm sm:text-base font-semibold text-[#2C3E50] mb-1 tracking-tight'>
                        Expiration Alerts
                      </h4>
                      <p className='text-xs sm:text-sm text-[#7F8C8D]'>
                        Get notified before leases and documents expire
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className='bg-gradient-to-br from-[#3498DB] to-[#2980B9] rounded-xl p-4 sm:p-6 text-white order-1 lg:order-2'>
                <div className='text-center'>
                  <FolderOpen className='h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-white' />
                  <h4 className='text-lg sm:text-xl font-bold mb-2 tracking-tight'>
                    Storage Capacity
                  </h4>
                  <p className='text-xl sm:text-2xl font-bold mb-2'>
                    Unlimited
                  </p>
                  <p className='text-xs sm:text-sm opacity-90'>
                    Store as many documents as you need
                  </p>
                </div>
                <div className='mt-4 sm:mt-6 space-y-2 sm:space-y-3'>
                  <div className='flex justify-between items-center text-sm sm:text-base'>
                    <span>File Types</span>
                    <span className='font-semibold'>All Formats</span>
                  </div>
                  <div className='flex justify-between items-center text-sm sm:text-base'>
                    <span>Max File Size</span>
                    <span className='font-semibold'>100MB</span>
                  </div>
                  <div className='flex justify-between items-center text-sm sm:text-base'>
                    <span>Backup Retention</span>
                    <span className='font-semibold'>Forever</span>
                  </div>
                  <div className='flex justify-between items-center text-sm sm:text-base'>
                    <span>Access Speed</span>
                    <span className='font-semibold'>Instant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section
        id='security-compliance'
        className='py-12 sm:py-16 lg:py-20 bg-[#2C3E50] text-white'
      >
        <div className='max-w-7xl mx-auto px-4 md:px-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center'>
            <div className='text-center lg:text-left'>
              <div className='flex items-center justify-center lg:justify-start gap-2 mb-4 sm:mb-6'>
                <Lock className='text-[#1ABC9C] text-xl sm:text-2xl' />
                <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight  '>
                  Enterprise-Grade Security
                </h2>
              </div>
              <p className='text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0'>
                Your documents are protected with bank-level security. We use
                advanced encryption, secure data centers, and compliance
                standards to keep your sensitive property information safe.
              </p>
              <div className='flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 lg:gap-3 xl:gap-6'>
                <div className='flex items-center gap-2'>
                  <Shield className='text-[#2ECC71] text-sm sm:text-base' />
                  <span className='text-xs sm:text-sm'>SSL Encrypted</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Lock className='text-[#2ECC71] text-sm sm:text-base' />
                  <span className='text-xs sm:text-sm'>GDPR Compliant</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge
                    variant='outlined'
                    className='text-[#2ECC71] bg-transparent border-[#2ECC71] text-xs sm:text-sm px-2 py-1'
                  >
                    ISO 27001 Certified
                  </Badge>
                </div>
              </div>
            </div>
            <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20'>
              <img
                className='w-full h-48 sm:h-64 lg:h-80 object-cover rounded-xl'
                src='https://storage.googleapis.com/uxpilot-auth.appspot.com/secure-document-storage.png'
                alt='secure document storage interface with encryption and compliance features'
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
          <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight'>
            Ready to Go Paperless?
          </h2>
          <p className='text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-6 sm:mb-8 max-w-3xl mx-auto'>
            Join thousands of property managers who have organized their
            documents with LeaseUp&apos;s secure document management system
          </p>
          <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-lg mx-auto'>
            <Button
              size='lg'
              className='bg-[#1ABC9C] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium hover:bg-[#16A085] transition-colors flex items-center justify-center gap-2 w-full sm:w-auto'
            >
              <ArrowRight className='h-4 w-4' />
              Start Organizing Today
            </Button>
            <Button
              size='lg'
              variant='outlined'
              className='border-2 border-white text-white bg-transparent px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium hover:bg-white hover:text-[#3498DB] transition-colors flex items-center justify-center gap-2 w-full sm:w-auto'
            >
              <Download className='h-4 w-4' />
              View Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
