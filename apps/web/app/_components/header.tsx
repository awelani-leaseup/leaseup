'use client';

import { useState, useEffect, FC, ComponentProps } from 'react';
import { Button } from '@leaseup/ui/components/button';
import Link from 'next/link';

const SIGNIN_URL = process.env.NEXT_PUBLIC_SIGNIN_URL ?? '';
const SIGNUP_URL = process.env.NEXT_PUBLIC_SIGNUP_URL ?? '';

export const Header: FC<ComponentProps<'header'>> = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-[#ECF0F1]/80 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
      role='banner'
    >
      <div className='max-w-7xl mx-auto px-4 md:px-8'>
        <div className='flex items-center justify-between h-16'>
          <div className='flex items-center gap-3'>
            <Link
              href='/'
              aria-label='Leaseup Home'
              className='flex items-center gap-2'
            >
              <img
                src='/leaseup-logo.svg'
                alt='Leaseup logo - property management platform'
                className='w-8 h-8 rounded-lg cursor-pointer'
              />
              <span
                className={`text-xl font-bold ${isScrolled ? 'text-black' : 'text-black'}`}
              >
                Leaseup
              </span>
            </Link>
          </div>
          <nav
            className='hidden md:flex items-center gap-8'
            aria-label='Main navigation'
          >
            <Link
              href='#features'
              className={`${isScrolled ? 'text-black' : 'text-black'} hover:text-white transition-colors`}
            >
              Features
            </Link>
            <Link
              href='#pricing'
              className={`${isScrolled ? 'text-black' : 'text-black'} hover:text-black transition-colors`}
            >
              Pricing
            </Link>
            <Link
              href='#reviews'
              className={`${isScrolled ? 'text-black' : 'text-black'} hover:text-black transition-colors`}
            >
              Reviews
            </Link>
            <Link
              href='#contact'
              className={`${isScrolled ? 'text-black' : 'text-black'} hover:text-black transition-colors`}
            >
              Contact
            </Link>
          </nav>
          <div className='flex items-center gap-4'>
            <Button asChild>
              <Link href={SIGNIN_URL} aria-label='Sign in to your account'>
                Sign In
              </Link>
            </Button>
            <Link
              href={SIGNUP_URL}
              target='_blank'
              rel='noopener noreferrer'
              className='bg-[#1ABC9C] text-white px-6 py-2 rounded-lg hover:bg-[#2980B9] transition-colors'
              aria-label='Get started with Leaseup'
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
