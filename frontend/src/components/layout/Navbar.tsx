"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HiMenu, HiX } from "react-icons/hi";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";


interface NavbarItem {
  name: string;
  link: string;
}

export function NavbarDemo() {
  const navItems: NavbarItem[] = [
    { name: "Dashboard", link: "/dashboard" },
    { name: "About Us", link: "/about" },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  
  const isActive = (link: string) => pathname === link || pathname?.startsWith(link + "/");
  
  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="fixed inset-x-0 top-4 z-50">
      <div
        className="
        md:mx-auto max-w-6xl mx-4
        bg-linear-to-r from-gray-900/95 via-gray-900/95 to-gray-950/95
        border border-gray-800/50
        backdrop-blur-lg rounded-full px-4 py-2 
        flex items-center justify-between shadow-xl shadow-black/20 transition-colors
      "
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center space-x-2">
          <span className="font-bold text-xl bg-linear-to-r from-blue-300 to-blue-400 bg-clip-text text-transparent mx-2">
            TradeHub
          </span>
        </Link>

        {/* Desktop Nav Items */}
        <div className="hidden lg:flex space-x-6">
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.link}
              className={`px-3 py-1 rounded-full text-sm font-medium transition
                         ${isActive(item.link) 
                           ? 'text-white bg-white/15' 
                           : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
            >
              {item.name}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              href="/portfolio"
              className={`px-3 py-1 rounded-full text-sm font-medium transition
                         ${isActive('/portfolio') 
                           ? 'text-white bg-white/15' 
                           : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
            >
              Portfolio
            </Link>
          )}
        </div>

        {/* Desktop Buttons & Theme Toggle */}
        <div className="hidden lg:flex items-center gap-3">
          {isLoading ? (
            <div className="w-10 h-10 rounded-full bg-gray-700/50 animate-pulse" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full bg-blue-400/20 border border-blue-300/30
                           flex items-center justify-center font-bold text-blue-300 
                           shadow-md hover:-translate-y-0.5 hover:bg-blue-400/30 transition cursor-pointer"
                title={user.username}
              >
                {user.username[0].toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded-full text-sm font-medium text-gray-300 
                           hover:text-white hover:bg-white/10 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-1 rounded-full text-sm font-bold 
                         text-gray-900 
                         bg-blue-400 hover:bg-blue-300
                         shadow-md hover:-translate-y-0.5 transition"
            >
              Investor Login
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="lg:hidden flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition"
          >
            {isMobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:mx-auto mx-4 mt-2 max-w-4xl 
                       bg-linear-to-r from-gray-900/98 via-gray-900/98 to-gray-950/98
                       border border-gray-800/50
                       backdrop-blur-md rounded-xl shadow-xl shadow-black/20 
                       flex flex-col px-6 py-3 lg:hidden"
          >
            {navItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-2 rounded-md transition px-2
                           ${isActive(item.link) 
                             ? 'text-white bg-white/15' 
                             : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
              >
                {item.name}
              </Link>
            ))}

            <div className="flex flex-col gap-2 mt-2">
            </div>
            {isAuthenticated && (
              <Link
                href="/portfolio"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-2 rounded-md transition px-2
                           ${isActive('/portfolio') 
                             ? 'text-white bg-white/15' 
                             : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
              >
                Portfolio
              </Link>
            )}
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-800">
                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-full bg-blue-400/20 border border-blue-300/30
                         flex items-center justify-center font-bold text-blue-300"
                  >
                    {user.username[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-300">{user.username}</span>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-3 py-1 rounded-full text-sm font-medium text-gray-300 
                             hover:text-white hover:bg-white/10 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full px-4 py-2 rounded-full font-bold text-center
                     text-gray-900 
                     bg-blue-400 hover:bg-blue-300
                     shadow-md hover:-translate-y-0.5 transition mt-2"
              >
                Login
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
