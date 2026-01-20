'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');

  if (isAuthPage) {
    return null;
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/predict', label: 'Predict' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-teal-900/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-18 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-all duration-300">
              <span className="text-xl sm:text-2xl font-bold text-white">₹</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <span className="text-xl sm:text-2xl font-bold gradient-text-teal">
              TradeHub
            </span>
          </Link>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'text-teal-400 bg-teal-500/10' 
                      : 'text-slate-400 hover:text-teal-300 hover:bg-teal-500/5'
                    }
                  `}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <div className="md:hidden flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200
                    ${pathname === link.href
                      ? 'text-teal-400 bg-teal-500/10'
                      : 'text-slate-400 hover:text-teal-300'
                    }
                  `}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            <Link href="/auth/login">
              <Button
                variant="primary"
                size="sm"
                className="shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
