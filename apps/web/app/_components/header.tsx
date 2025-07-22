'use client';

import { useState, useEffect, FC, ComponentProps } from 'react';
import { Button } from '@leaseup/ui/components/button';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@leaseup/ui/components/navigation-menu';
import Link from 'next/link';

const SIGNIN_URL = process.env.NEXT_PUBLIC_SIGNIN_URL ?? '';
const SIGNUP_URL = process.env.NEXT_PUBLIC_SIGNUP_URL ?? '';

export const Header: FC<ComponentProps<'header'>> = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside or on a link
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

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
          {/* Logo */}
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

          {/* Desktop Navigation */}
          <NavigationMenu viewport={false} className='hidden md:flex'>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href='#features'
                    className={`${isScrolled ? 'text-black' : 'text-black'} hover:text-black transition-colors px-4 py-2`}
                  >
                    Features
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href='#pricing'
                    className={`${isScrolled ? 'text-black' : 'text-black'} hover:text-black transition-colors px-4 py-2`}
                  >
                    Pricing
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href='#reviews'
                    className={`${isScrolled ? 'text-black' : 'text-black'} hover:text-black transition-colors px-4 py-2`}
                  >
                    Reviews
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href='#contact'
                    className={`${isScrolled ? 'text-black' : 'text-black'} hover:text-black transition-colors px-4 py-2`}
                  >
                    Contact
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Desktop Buttons */}
          <div className='hidden md:flex items-center gap-4'>
            <Button asChild color='secondary'>
              <Link href={SIGNIN_URL} aria-label='Sign in to your account'>
                Sign In
              </Link>
            </Button>
            <Button asChild>
              <Link
                href={SIGNUP_URL}
                target='_blank'
                rel='noopener noreferrer'
                className='bg-[#1ABC9C] text-white px-6 py-2 rounded-lg hover:bg-[#2980B9] transition-colors'
                aria-label='Get started with Leaseup'
              >
                Get Started
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className='md:hidden flex flex-col items-center justify-center w-8 h-8 space-y-1.5'
            onClick={toggleMobileMenu}
            aria-label='Toggle mobile menu'
            aria-expanded={isMobileMenuOpen}
          >
            <span
              className={`w-6 h-0.5 bg-black transition-all duration-300 ${
                isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-black transition-all duration-300 ${
                isMobileMenuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-black transition-all duration-300 ${
                isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? 'max-h-96 opacity-100 pb-6'
              : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <nav className='flex flex-col space-y-4 pt-4 border-t border-gray-200'>
            <Link
              href='#features'
              className='text-black hover:text-gray-600 transition-colors px-4 py-2 text-left'
              onClick={closeMobileMenu}
            >
              Features
            </Link>
            <Link
              href='#pricing'
              className='text-black hover:text-gray-600 transition-colors px-4 py-2 text-left'
              onClick={closeMobileMenu}
            >
              Pricing
            </Link>
            <Link
              href='#reviews'
              className='text-black hover:text-gray-600 transition-colors px-4 py-2 text-left'
              onClick={closeMobileMenu}
            >
              Reviews
            </Link>
            <Link
              href='#contact'
              className='text-black hover:text-gray-600 transition-colors px-4 py-2 text-left'
              onClick={closeMobileMenu}
            >
              Contact
            </Link>

            {/* Mobile Buttons */}
            <div className='flex flex-col gap-3 px-4 pt-4'>
              <Button asChild className='w-full' color='secondary'>
                <Link
                  href={SIGNIN_URL}
                  aria-label='Sign in to your account'
                  onClick={closeMobileMenu}
                >
                  Sign In
                </Link>
              </Button>
              <Button asChild>
                <Link
                  href={SIGNUP_URL}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='bg-[#1ABC9C] text-white px-6 py-3 rounded-lg hover:bg-[#2980B9] transition-colors text-center w-full'
                  aria-label='Get started with Leaseup'
                  onClick={closeMobileMenu}
                >
                  Get Started
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
