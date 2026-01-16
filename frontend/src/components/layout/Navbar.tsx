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

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/portfolio', label: 'Portfolio' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center space-x-4 sm:space-x-6 lg:space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <span className="text-base sm:text-lg font-bold text-white">₹</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-white">TradeHub</span>
            </Link>
            <div className="hidden space-x-1 sm:flex">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200
                      ${
                        isActive
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden items-center space-x-2 text-xs sm:text-sm text-gray-400 sm:flex">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="hidden lg:inline">Market Open</span>
            </div>
            <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
              <span className="hidden sm:inline">Profile</span>
              <span className="sm:hidden">👤</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
