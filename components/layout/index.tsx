"use client";

import * as React from 'react';
import Image from 'next/image';
import { Github, Linkedin, Facebook, Youtube, Globe, Code } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authClient, signOut } from '@/lib/auth-client';
import { Button } from '../ui/Button';

export function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className='sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto flex h-14 items-center justify-between px-4'>
        <div className='flex items-center space-x-4'>
          <Link href='/' className='font-bold text-xl text-primary'>PlateWise</Link>
          <nav className='hidden md:flex items-center space-x-4 text-sm font-medium'>
            <Link href='/recipes' className='transition-colors hover:text-primary'>Explore</Link>
            <Link href='/about' className='transition-colors hover:text-primary'>About</Link>
            
            {session && (
              <>
                <Link href='/recipes/add' className='transition-colors hover:text-primary text-accent'>Add Recipe</Link>
                <Link href='/recipes/manage' className='transition-colors hover:text-primary'>Manage Recipes</Link>
                <Link href='/ai/generate' className='transition-colors hover:text-primary text-primary'>AI Generate</Link>
                <Link href='/ai/recommendations' className='transition-colors hover:text-primary'>AI Recommendations</Link>
              </>
            )}
          </nav>
        </div>
        <div className='flex items-center space-x-4'>
          <ThemeToggle />
          {!isPending && !session ? (
            <>
              <Link href='/login' className='text-sm font-medium hover:text-primary'>Login</Link>
              <Link href='/register'>
                <Button size="sm" variant="primary">Sign Up</Button>
              </Link>
            </>
          ) : !isPending && session ? (
            <div className='flex items-center space-x-4'>
              <span className='text-sm text-neutral-foreground hidden sm:inline-block'>
                Hello, {session.user.name.split(' ')[0]}
              </span>
              <Button onClick={handleLogout} variant="ghost" size="sm">Logout</Button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className='border-t border-border bg-background py-8 md:py-6'>
      <div className='container mx-auto flex flex-col items-center gap-6 px-4'>
        <div className='flex flex-col md:flex-row items-center justify-between w-full gap-6'>
          <div className='text-center md:text-left'>
            <Link href='/' className='font-bold text-xl text-primary mb-2 inline-block'>PlateWise</Link>
            <p className='text-sm text-neutral-foreground'>© {new Date().getFullYear()} PlateWise. All rights reserved.</p>
          </div>
          
          <div className='flex flex-col items-center md:items-end gap-3'>
            <div className='flex items-center gap-3 bg-muted/30 p-2 pr-4 rounded-full border border-border/50'>
              <div className='relative w-10 h-10 overflow-hidden rounded-full border-2 border-primary'>
                <Image 
                  src='/assets/developer_Nur.jpeg' 
                  alt='Md. Nur A Alam' 
                  fill 
                  className='object-cover'
                />
              </div>
              <div className='flex flex-col'>
                <span className='text-xs text-neutral-foreground font-medium'>Developed by</span>
                <span className='text-sm font-bold text-foreground'>Md. Nur A Alam</span>
              </div>
            </div>
            
            <div className='flex flex-wrap justify-center md:justify-end items-center gap-4 text-neutral-foreground'>
              <a href='https://md-nur-a-alam-portfolio.vercel.app' target='_blank' rel='noreferrer' className='hover:text-primary transition-colors' title='Portfolio'>
                <Globe className='w-4 h-4' />
              </a>
              <a href='https://github.com/Md-Nur-A-Alam' target='_blank' rel='noreferrer' className='hover:text-primary transition-colors' title='GitHub'>
                <Github className='w-4 h-4' />
              </a>
              <a href='https://www.linkedin.com/in/md-nur-a-alam13/' target='_blank' rel='noreferrer' className='hover:text-primary transition-colors' title='LinkedIn'>
                <Linkedin className='w-4 h-4' />
              </a>
              <a href='https://web.facebook.com/Md.NurAAlamSoikot/' target='_blank' rel='noreferrer' className='hover:text-primary transition-colors' title='Facebook'>
                <Facebook className='w-4 h-4' />
              </a>
              <a href='https://www.youtube.com/@NurAAlam44' target='_blank' rel='noreferrer' className='hover:text-primary transition-colors' title='YouTube'>
                <Youtube className='w-4 h-4' />
              </a>
              <a href='https://codeforces.com/profile/Nur_Alam.2812' target='_blank' rel='noreferrer' className='hover:text-primary transition-colors' title='Codeforces'>
                <Code className='w-4 h-4' />
              </a>
            </div>
            <div className='text-xs text-neutral-foreground mt-1'>
              <span className='mr-3'>📱 +8801307631378</span>
              <span>📱 +8801643067065</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PageContainer({ children }: { children: React.ReactNode }) {
  return <main className='container mx-auto px-4 py-8 min-h-[calc(100vh-3.5rem-4rem)]'>{children}</main>
}
