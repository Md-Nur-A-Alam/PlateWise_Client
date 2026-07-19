"use client";

import * as React from 'react';
import Image from 'next/image';
import { Globe, Code, Menu, X } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authClient, signOut } from '@/lib/auth-client';
import { Button } from '../ui/Button';
import { FaFacebookSquare, FaGithub, FaLinkedin } from 'react-icons/fa';
import { IoLogoYoutube } from 'react-icons/io';

export function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className='sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto flex h-14 items-center justify-between px-4'>
        <div className='flex items-center space-x-4'>
          <button 
            className='md:hidden p-1 -ml-1 mr-2 text-foreground focus:outline-none' 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label='Toggle Menu'
          >
            {isMobileMenuOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
          </button>
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
        <div className='flex items-center space-x-2 sm:space-x-4'>
          <ThemeToggle />
          {!isPending && !session ? (
            <div className='hidden sm:flex items-center space-x-4'>
              <Link href='/login' className='text-sm font-medium hover:text-primary'>Login</Link>
              <Link href='/register'>
                <Button size="sm" variant="primary">Sign Up</Button>
              </Link>
            </div>
          ) : !isPending && session ? (
            <div className='flex items-center space-x-2 sm:space-x-4'>
              <span className='text-sm text-neutral-foreground hidden sm:inline-block'>
                Hello, {session.user.name.split(' ')[0]}
              </span>
              <Button onClick={handleLogout} variant="ghost" size="sm" className="hidden sm:inline-flex">Logout</Button>
            </div>
          ) : null}
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className='md:hidden absolute top-14 left-0 w-full bg-background border-b border-border shadow-lg'>
          <nav className='flex flex-col p-4 space-y-4 text-sm font-medium'>
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
            
            <div className='pt-4 border-t border-border flex flex-col space-y-4'>
              {!isPending && !session ? (
                <>
                  <Link href='/login' className='w-full text-left transition-colors hover:text-primary'>Login</Link>
                  <Link href='/register'>
                    <Button size="sm" variant="primary" className='w-full'>Sign Up</Button>
                  </Link>
                </>
              ) : !isPending && session ? (
                <>
                  <span className='text-sm text-neutral-foreground'>
                    Signed in as {session.user.name}
                  </span>
                  <Button onClick={handleLogout} variant="ghost" size="sm" className="w-full justify-start px-0">Logout</Button>
                </>
              ) : null}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

import { CUISINES } from '../../constants/cuisines';

export function Footer() {
  const displayCuisines = CUISINES.slice(0, 5);
  
  return (
    <footer className='border-t border-border bg-background pt-12 pb-6'>
      <div className='container mx-auto px-4'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12'>
          
          {/* Column 1: Brand */}
          <div className='flex flex-col gap-4'>
            <Link href='/' className='font-bold text-2xl text-primary inline-block'>PlateWise</Link>
            <p className='text-sm text-neutral-foreground max-w-xs'>
              Your intelligent companion for discovering, managing, and creating delicious recipes with AI.
            </p>
            
            <div className='mt-2'>
              <span className='text-xs font-semibold uppercase tracking-wider text-neutral-foreground mb-3 block'>Developed by Md. Nur A Alam</span>
              <div className='flex items-center gap-4'>
                <div className='relative w-10 h-10 overflow-hidden rounded-full border border-primary/20'>
                  <Image 
                    src='/assets/developer_Nur.jpeg' 
                    alt='Md. Nur A Alam' 
                    fill 
                    className='object-cover'
                  />
                </div>
                <div className='flex gap-3 text-neutral-foreground'>
                  <a href='https://md-nur-a-alam-portfolio.vercel.app' target='_blank' rel='noreferrer' className='hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded p-1 -m-1' aria-label='Portfolio'>
                    <Globe className='w-4 h-4' />
                  </a>
                  <a href='https://github.com/Md-Nur-A-Alam' target='_blank' rel='noreferrer' className='hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded p-1 -m-1' aria-label='GitHub'>
                    <FaGithub className='w-4 h-4' />
                  </a>
                  <a href='https://www.linkedin.com/in/md-nur-a-alam13/' target='_blank' rel='noreferrer' className='hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded p-1 -m-1' aria-label='LinkedIn'>
                    <FaLinkedin className='w-4 h-4' />
                  </a>
                  <a href='https://web.facebook.com/Md.NurAAlamSoikot/' target='_blank' rel='noreferrer' className='hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded p-1 -m-1' aria-label='Facebook'>
                    <FaFacebookSquare className='w-4 h-4' />
                  </a>
                  <a href='https://www.youtube.com/@NurAAlam44' target='_blank' rel='noreferrer' className='hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded p-1 -m-1' aria-label='YouTube'>
                    <IoLogoYoutube className='w-4 h-4' />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div className='flex flex-col gap-3'>
            <h3 className='font-bold text-foreground mb-1'>Explore</h3>
            <Link href='/recipes' className='text-sm text-neutral-foreground hover:text-primary hover:underline transition-all focus:outline-none focus:ring-2 focus:ring-primary rounded-sm w-fit inline-block'>All Recipes</Link>
            <Link href='/recipes?sort=newest' className='text-sm text-neutral-foreground hover:text-primary hover:underline transition-all focus:outline-none focus:ring-2 focus:ring-primary rounded-sm w-fit inline-block'>Newest Arrivals</Link>
            <Link href='/recipes?sort=rating' className='text-sm text-neutral-foreground hover:text-primary hover:underline transition-all focus:outline-none focus:ring-2 focus:ring-primary rounded-sm w-fit inline-block'>Top Rated</Link>
          </div>

          {/* Column 3: Cuisines */}
          <div className='flex flex-col gap-3'>
            <h3 className='font-bold text-foreground mb-1'>Cuisines</h3>
            {displayCuisines.map((cuisine) => (
              <Link 
                key={cuisine} 
                href={`/recipes?cuisine=${encodeURIComponent(cuisine)}`} 
                className='text-sm text-neutral-foreground hover:text-primary hover:underline transition-all focus:outline-none focus:ring-2 focus:ring-primary rounded-sm w-fit inline-block'
              >
                {cuisine}
              </Link>
            ))}
            <Link href='/recipes' className='text-sm text-primary font-medium hover:underline transition-all focus:outline-none focus:ring-2 focus:ring-primary rounded-sm w-fit inline-block mt-1'>
              View all cuisines &rarr;
            </Link>
          </div>

          {/* Column 4: Company */}
          <div className='flex flex-col gap-3'>
            <h3 className='font-bold text-foreground mb-1'>Company</h3>
            <Link href='/about' className='text-sm text-neutral-foreground hover:text-primary hover:underline transition-all focus:outline-none focus:ring-2 focus:ring-primary rounded-sm w-fit inline-block'>About Us</Link>
            <Link href='/contact' className='text-sm text-neutral-foreground hover:text-primary hover:underline transition-all focus:outline-none focus:ring-2 focus:ring-primary rounded-sm w-fit inline-block'>Contact</Link>
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className='flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50 text-xs text-neutral-foreground'>
          <p>© {new Date().getFullYear()} PlateWise. All rights reserved.</p>
          <div className='flex items-center gap-4'>
            <span>📱 +8801307631378</span>
            <span>📱 +8801643067065</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PageContainer({ children }: { children: React.ReactNode }) {
  return <main className='container mx-auto px-4 py-8 min-h-[calc(100vh-3.5rem-4rem)]'>{children}</main>
}
