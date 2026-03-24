"use client";

import UserActions from "@/actions/UserAction";
import { useUser } from "@/context/UserContext";
import { navItems } from "@/utils/navItems";
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
            <div
                key={link?.id}
                className="relative w-full pr-5">
                <Link
                    href={link?.href}
                    className={`flex items-center justify-start gap-2.5 w-full px-3 py-2 rounded-xl transition-all duration-300 cursor-pointer backdrop-blur-sm
                            ${isActive
                            ? "bg-white/20 text-white shadow-lg border border-white/20"
                            : "text-gray-300 hover:bg-white/10 hover:text-white"
                        }`}>
                    <Icon />
                    <span className="text-base text-white font-medium">{link?.name}</span>
                </Link>
            </div>
        )
    }

    const handleLogout = () => {
        UserActions.logout();
        setUser(null);
        router.push("/");
    };

    return (
        <div className="max-w-[250px] w-full h-screen px-0 pb-6 pt-[145px]">
            <div className="min-h-full relative glass-card sticky top-[145px]">
                <div className="flex flex-col justify-between min-h-[calc(85vh-80px)] pl-5 pt-5">
                    <div className="flex flex-col gap-3 items-start justify-start w-full flex-1">
                        {
                            navItems?.map(link => (
                                <SideMenuLinks key={link.id} link={link} />
                            ))
                        }
                    </div>
                    <div className="relative w-full pr-5">
                        <button className="flex items-center justify-start gap-2.5 w-full px-3 py-2 rounded-xl transition-all duration-300 cursor-pointer backdrop-blur-sm text-gray-300 hover:bg-white/10 hover:text-white"
                            onClick={handleLogout}>
                            <LogOut />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;