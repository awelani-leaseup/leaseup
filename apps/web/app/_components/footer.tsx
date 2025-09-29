import { H5 } from '@leaseup/ui/components/typography';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer id='footer' className='bg-[#2C3E50] text-white py-12'>
      <div className='max-w-7xl mx-auto px-4 md:px-8'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div>
            <div className='flex items-center gap-3 mb-4'>
              <div className='bg-[#3498DB] text-white h-10 w-10 rounded-lg flex items-center justify-center'>
                <i className='fa-solid fa-building'></i>
              </div>
              <span className='text-xl font-bold'>LeaseUp</span>
            </div>
            <p className='text-gray-400'>
              Modern tenant management for smart landlords
            </p>
          </div>
          {/* <div>
            <H5 className='font-semibold mb-4'>Product</H5>
            <div className='flex flex-col gap-4'>
              <Link
                href='/features/rent-collection'
                className='text-gray-400 hover:text-white cursor-pointer'
              >
                Rent Collection
              </Link>
              <Link
                href='/features/property-management'
                className='text-gray-400 hover:text-white cursor-pointer'
              >
                Property Management
              </Link>
              <Link
                href='/features/tenant-management'
                className='text-gray-400 hover:text-white cursor-pointer'
              >
                Tenant Management
              </Link>
              <Link
                href='/features/document-management'
                className='text-gray-400 hover:text-white cursor-pointer'
              >
                Document Management
              </Link>
              <Link
                href='/features/maintenance-requests'
                className='text-gray-400 hover:text-white cursor-pointer'
              >
                Maintenance Requests
              </Link>
              <Link
                href='/features/financial-reports'
                className='text-gray-400 hover:text-white cursor-pointer'
              >
                Financial Reports
              </Link>
            </div>
          </div> */}
          <div>
            <H5 className='font-semibold mb-4'>Support</H5>
            <div className='space-y-2'>
              <p className='text-gray-400 hover:text-white cursor-pointer'>
                Help Center
              </p>
              <p className='text-gray-400 hover:text-white cursor-pointer'>
                Contact
              </p>
              <p className='text-gray-400 hover:text-white cursor-pointer'>
                Status
              </p>
            </div>
          </div>
          <div>
            <H5 className='font-semibold mb-4'>Company</H5>
            <div className='flex flex-col gap-4'>
              <Link
                href='/terms-of-service'
                className='text-gray-400 hover:text-white cursor-pointer'
              >
                Terms of Service
              </Link>
              <Link
                href='/privacy-policy'
                className='text-gray-400 hover:text-white cursor-pointer'
              >
                Privacy Policy
              </Link>
              <Link
                href='/cookie-policy'
                className='text-gray-400 hover:text-white cursor-pointer'
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
        <div className='border-t border-gray-600 mt-8 pt-8 text-center text-gray-400'>
          <p>&copy; {new Date().getFullYear()} LeaseUp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
