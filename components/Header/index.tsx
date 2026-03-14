"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const Header = () => {

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed w-full top-0 z-50 ${ scrolled ? 'glass' : '' }`}>
      <div className="w-full border-b px-15 py-5 flex justify-center bg-[#1a1a1a] opacity-100">
        <div className="w-full flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/Logo.svg"
              alt="Statixoup Logo"
              width={180}
              height={60}
              priority
              className="h-fit"
            />
          </Link>

          <nav className="h-full flex items-center">
            <Link
              href="/account/dashboard"
              className="btn-primary text-white px-5 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm"
            >
              Go to Dashboard
            </Link>
          </nav>

        </div>
      </div>
    </header>
  );
};

export default Header;