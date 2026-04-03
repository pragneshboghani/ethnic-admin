"use client";

import '../globals.css'
import Header from "@/components/Header";
import SignIn from "../(auth)/sign-in/page";
import { UserProvider } from '@/context/UserContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import UserActions from '@/actions/UserAction';


export default function Home() {
  const router = useRouter();
  const pathname = usePathname();

  const [IsLogin, setIsLogin] = useState(false)

  useEffect(() => {
    const Login = UserActions.isLogin(router);
    setIsLogin(Login)
  }, [pathname]);

  useEffect(() => {
    if (IsLogin) {
      router.push("/account/dashboard");
    }
  }, [IsLogin, router]);
  return (
    <div className="App">
      <Header />
      <main className="pt-[105px]">
        <UserProvider>
          <SignIn />
        </UserProvider>
      </main>
    </div>
  );
}
