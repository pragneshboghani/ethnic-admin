"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Globe, 
  Users, 
  Tag, 
  Image as ImageIcon, 
} from 'lucide-react';

const Sidebar = () => {
    const pathname = usePathname();

    const navItems = [
        { id: 1, name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { id: 2, name: 'Blogs', href: '/admin/blogs', icon: FileText },
        { id: 3, name: 'Platforms', href: '/admin/platforms', icon: Globe },
        { id: 4, name: 'Authors', href: '/admin/authors', icon: Users },
        { id: 5, name: 'Categories', href: '/admin/categories', icon: Tag },
        { id: 6, name: 'Media Library', href: '/admin/media', icon: ImageIcon },
    ];

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
                className="relative w-full pr-5 pl-2.5">
                <div
                    className="flex items-center w-full">
                    <Link
                        href={link?.href}
                        className={`p-0 h-12 flex items-center justify-start gap-2.5 w-full transition-all duration-300 rounded-3xl cursor-pointer z-1 [&>svg]:!w-5 [&>svg]:!h-5 ${isActive ? "pl-4 primary-time-button" : "pl-5 sidebar-menu-link-btn"}`}>
                        <Icon />
                        <span className="text-base text-white font-medium">{link?.name}</span>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-[280px] w-full min-h-screen h-full px-0 pb-6 pt-[135px] sticky top-0">
            <div className="h-full sidebar-wrapper relative flex flex-col pt-2.5">
                <div className="flex flex-col gap-7.5 items-start justify-start w-full h-full flex-1">
                    {
                        navItems?.map(link => (
                            <SideMenuLinks key={link.id} link={link} />
                        ))
                    }
                </div>

                {/* <div className="pt-7.5 pb-2.5 flex flex-col items-start justify-start w-full">
                    <div className="pr-5 pl-2.5 w-full flex items-center">
                        <Logout />
                    </div>
                </div> */}
            </div>
        </div>
    );
}

export default Sidebar;