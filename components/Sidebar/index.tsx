"use client";

import UserActions from "@/actions/UserAction";
import { useUser } from "@/context/UserContext";
import { navItems } from "@/utils/navItems";
import Image from "next/image";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const Sidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { setUser } = useUser();

    const SideMenuLinks = ({ link }: {
        link: {
            id: number;
            name: string;
            href: string;
            icon: React.ElementType;
        }
    }) => {
        const isActive = pathname.startsWith(link?.href);
        const Icon = link.icon;

        return (
            <Link
                href={link?.href}
                className={`group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-200 ${
                    isActive
                        ? "border-[#2b3950] bg-[#182233] text-[#eef4ff] shadow-[0_16px_34px_rgba(0,0,0,0.24)]"
                        : "border-transparent text-[#8fa0b6] hover:border-white/10 hover:bg-white/[0.03] hover:text-[#eef4ff]"
                }`}
            >
                <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 ${
                        isActive
                            ? "border-[#31425e] bg-[#111a28] text-[#9ad8de]"
                            : "border-white/8 bg-[#101826] text-[#6f8096] group-hover:border-[#243247] group-hover:text-[#c4d3e6]"
                    }`}
                >
                    <Icon size={18} />
                </span>
                <span
                    className={`text-sm font-medium ${
                        isActive ? "text-[#eef4ff]" : "text-[#8fa0b6]"
                    }`}
                >
                    {link?.name}
                </span>
            </Link>
        );
    };

    const handleLogout = () => {
        UserActions.logout();
        setUser(null);
        router.push("/");
    };

    return (
        <aside className="relative w-full border-b border-white/8 bg-[#0f1724] lg:w-[248px] lg:shrink-0 lg:border-b-0 lg:border-r">
            <div className="absolute bottom-0 left-0 h-40 w-36 rounded-tr-[44px] bg-[radial-gradient(circle_at_20%_70%,rgba(73,112,164,0.28),rgba(73,112,164,0.02)_58%),radial-gradient(circle_at_70%_90%,rgba(92,59,141,0.24),rgba(92,59,141,0.02)_54%)]" />

            <div className="relative flex h-full flex-col px-5 py-6 sm:px-6 lg:min-h-[calc(100vh-48px)] lg:px-6 lg:py-7">
                <Link href="/account/dashboard" className="inline-flex items-center self-start">
                    <Image
                        src="/assets/Logo.svg"
                        alt="Ethnic Infotech"
                        width={188}
                        height={62}
                        priority
                        className="h-auto w-[152px]"
                    />
                </Link>

                <div className="mt-9 flex flex-col items-center text-center">
                    <h3 className="text-[22px] font-semibold tracking-tight text-[#eef4ff]">
                        Ethnic Admin
                    </h3>
                    <p className="mt-1 text-sm text-[#7f90a8]">
                        hello@ethnicinfotech.in
                    </p>
                </div>

                <div className="mt-9 flex-1 space-y-2">
                    {navItems?.map((link) => (
                        <SideMenuLinks key={link.id} link={link} />
                    ))}
                </div>

                <div className="mt-6 border-t border-white/8 pt-5">
                    <button
                        className="group flex w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm transition-all duration-200 hover:border-white/10 hover:bg-white/[0.03]"
                        onClick={handleLogout}
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-[#101826] text-[#6f8096] transition-all duration-200 group-hover:border-[#243247] group-hover:text-[#c4d3e6]">
                            <LogOut size={18} />
                        </span>
                        <span className="font-medium text-[#8fa0b6]">Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
