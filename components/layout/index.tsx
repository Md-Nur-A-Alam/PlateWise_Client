import * as React from 'react';
import { ThemeToggle } from './ThemeToggle';
import Link from 'next/link';

export function Navbar() {
  return (
    <header className='sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto flex h-14 items-center justify-between px-4'>
        <div className='flex items-center space-x-4'>
          <Link href='/' className='font-bold text-xl text-primary'>PlateWise</Link>
          <nav className='hidden md:flex items-center space-x-4 text-sm font-medium'>
            <Link href='/recipes' className='transition-colors hover:text-primary'>Explore</Link>
            <Link href='/about' className='transition-colors hover:text-primary'>About</Link>
          </nav>
        </div>
        <div className='flex items-center space-x-4'>
          <ThemeToggle />
          <Link href='/login' className='text-sm font-medium hover:text-primary'>Login</Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className='border-t border-border bg-background py-6 md:py-0'>
      <div className='container mx-auto flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4'>
        <p className='text-sm text-neutral-foreground'>© 2026 PlateWise. All rights reserved.</p>
        <div className='flex items-center space-x-4 text-sm font-medium'>
          <Link href='/contact' className='hover:text-primary'>Contact</Link>
        </div>
      </div>
    </footer>
  );
}

export function PageContainer({ children }: { children: React.ReactNode }) {
  return <main className='container mx-auto px-4 py-8 min-h-[calc(100vh-3.5rem-4rem)]'>{children}</main>
}
