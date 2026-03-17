"use client";

import UserActions from "@/actions/UserAction";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import LayoutContainer from "@/components/common/LayoutContainer";
import { UserProvider } from "@/context/UserContext";
import { navItems } from "@/utils/navItems";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        UserActions.IsLogin(router);
    }, [pathname]);

    const activeTab = navItems.find((item) =>
        pathname.startsWith(item.href)
    );

    const ShowHeader =
        pathname === "/account/dashboard" ||
        pathname === "/account/blogs" ||
        pathname === "/account/plateforms" ||
        pathname === "/account/media";

    return (
        <UserProvider>
            <LayoutContainer>
                <div className="App">
                    <Header />
                    <ToastContainer position="top-right" autoClose={3000} />

                    <div className="max-w-full w-full h-full flex px-15">
                        <Sidebar />

                        <main className="w-full pb-6 ml-10 mt-[145px]">
                            <div className="text-white">
                                {ShowHeader && (
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h1 className="text-3xl font-semibold">{activeTab?.name}</h1>
                                            <p className="text-gray-400 text-sm">
                                                Manage your multi-platform content strategy.
                                            </p>
                                        </div>

                                        <Link href="/account/blogs/add" className="btn">
                                            + Create Blog
                                        </Link>
                                    </div>
                                )}

                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </LayoutContainer>
        </UserProvider>
    );
}