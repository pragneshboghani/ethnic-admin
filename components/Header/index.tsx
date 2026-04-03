"use client";

import Link from "next/link";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import UserActions from "@/actions/UserAction";

const headerFont = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthView = pathname === "/" || pathname.startsWith("/sign-in");
  const isDashboardView = pathname.startsWith("/account");

  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const Login = UserActions.isLogin(router);
    setIsLogin(Login);
  }, [pathname, router]);

  return (
    <header className="fixed top-0 z-50 w-full">
      <div
        className={`${headerFont.className} flex w-full justify-center border-b px-6 py-4 transition-all duration-300 sm:px-8 ${
          isAuthView
            ? "border-white/8 bg-[#0c1320]/92 backdrop-blur-2xl"
            : isDashboardView
              ? "border-white/8 bg-[#0c1320]/94 backdrop-blur-xl"
              : "border-white/10 bg-[#1a1a1a]"
        }`}
      >
        <div className="flex w-full max-w-[1500px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/Logo.svg"
              alt="Ethnic Infotech"
              width={188}
              height={62}
              priority
              className="h-auto w-[150px] sm:w-[188px]"
            />
          </Link>

          {isLogin && isAuthView && (
            <nav className="h-full flex items-center">
              <Link
                href="/account/dashboard"
                className="rounded-xl border border-white/10 bg-[#131d2c] px-4 py-2.5 text-sm font-medium text-[#edf3fb] transition-all duration-200 hover:border-[#31425e] hover:bg-[#182538]"
              >
                Go to Dashboard
              </Link>
            </nav>
          )}

          {isDashboardView && (
            <div className="hidden items-center gap-2 rounded-md border border-white/8 bg-[#131c2a] px-3 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[#8fa0b6] md:flex">
              Admin Workspace
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
