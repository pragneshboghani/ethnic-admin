"use client";

import { navItems } from "@/utils/navItems";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
    const pathname = usePathname();

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

    return (
        <div className="max-w-[200px] w-full h-screen h-full px-0 pb-6 pt-[145px]">
            <div className="min-h-full relative glass-card pl-5 pt-5 sticky top-[145px]">
                <div className="flex flex-col gap-3 items-start justify-start w-full h-full flex-1">
                    {
                        navItems?.map(link => (
                            <SideMenuLinks key={link.id} link={link} />
                        ))
                    }
                </div>
            </div>
        </div>
    );
}

export default Sidebar;