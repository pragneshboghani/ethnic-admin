"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import UserActions from "@/actions/UserAction";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [IsLogin, setIsLogin] = useState(false)

  useEffect(() => {
    const Login = UserActions.isLogin(router);
    setIsLogin(Login)
  }, [pathname]);

  return (
    <header className={`fixed w-full top-0 z-50`}>
      <div className="w-full border-b px-15 py-5 flex justify-center bg-[#1a1a1a] opacity-100">
        <div className="w-full flex justify-between items-center">
          <Link href={IsLogin ? "/account/dashboard" : "/"} className="flex items-center">
            <Image
              src="/assets/Logo.svg"
              alt="Statixoup Logo"
              width={180}
              height={60}
              priority
              className="h-fit"
            />
          </Link>

          {IsLogin &&
            <nav className="h-full flex items-center">
              <Link
                href="/account/dashboard"
                className="btn text-white px-5 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm"
              >
                Go to Dashboard
              </Link>
            </nav>
          }

        </div>
      </div>
    </header>
  );
};

export default Header;