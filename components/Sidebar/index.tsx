"use client";

import AuthorActions from "@/actions/AuthorActions";
import UserActions from "@/actions/UserAction";
import { useUser } from "@/context/UserContext";
import { navItems } from "@/utils/navItems";
import Image from "next/image";
import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Role } from "@/types";
import { useState, useSyncExternalStore } from "react";

const Sidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { setUser } = useUser();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const currentUserRole = useSyncExternalStore(
        () => () => {},
        () => (AuthorActions.getCurrentUserRole()?.role as Role) || null,
        () => null,
    );
    const hasCalendarAccess = useSyncExternalStore(
        () => () => {},
        () => AuthorActions.canAccessCalendar(),
        () => false,
    );

    const SideMenuLinks = ({ link }: {
        link: {
            id: number;
            name: string;
            href: string;
            icon: React.ElementType;
            roles?: Role[];
        }
    }) => {
        const isActive = pathname.startsWith(link?.href);
        const Icon = link.icon;

        return (
            <Link
                href={link?.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`group flex w-full items-center gap-3 rounded-2xl border p-2 sm:p-3 md:px-4 md:py-3 transition-all duration-200 ${isActive
                    ? "border-[var(--border-strong)] bg-[var(--bg-selected)] text-[var(--text-strong)] shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
                    : "border-transparent text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-black/[0.03] hover:text-[var(--text-strong)]"
                    }`}
            >
                <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 ${isActive
                        ? "border-[var(--accent)] bg-[var(--bg-inset)] text-[var(--accent)]"
                        : "border-[var(--border)] bg-[var(--bg-inset)] text-[var(--text-faint)] group-hover:border-[var(--border)] group-hover:text-[#2a486f]"
                        }`}
                >
                    <Icon size={18} />
                </span>
                <span
                    className={`text-sm font-medium ${isActive ? "text-[var(--text-strong)]" : "text-[var(--text-muted)]"
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
        setIsMobileMenuOpen(false);
        router.push("/");
    };

    const visibleNavItems = navItems.filter((link) => {
        if (link.requiresCalendarAccess && !hasCalendarAccess) {
            return false;
        }

        if (!link.roles) {
            return true;
        }

        return currentUserRole ? link.roles.includes(currentUserRole) : false;
    });

    const sidebarContent = (
        <>
            <Link
                href="/account/dashboard"
                className="hidden self-start rounded-2xl bg-[#0f1724] px-4 py-3 md:inline-flex md:items-center"
            >
                <Image
                    src="/assets/Logo.svg"
                    alt="Ethnic Infotech"
                    width={188}
                    height={62}
                    priority
                    className="h-auto w-[152px]"
                />
            </Link>

            <div className="md:mt-9 flex flex-row md:flex-col justify-between items-center text-center">
                <h3 className="text-[22px] font-semibold tracking-tight text-[var(--text-strong)]">
                    Ethnic Admin
                </h3>
                <p className="mt-1 text-sm text-[var(--text-subtle)]">
                    hello@ethnicinfotech.in
                </p>
            </div>

            <div className="mt-5 md:mt-9 flex-1 space-y-1 md:space-y-2">
                {visibleNavItems.map((link) => (
                    <SideMenuLinks key={link.id} link={link} />
                ))}
            </div>

            <div className="mt-3 md:mt-6 border-t border-[var(--border)] pt-3 md:pt-5">
                <button
                    className="group flex w-full items-center gap-3 rounded-2xl border border-transparent p-2 sm:p-3 md:px-4 md:py-3 text-sm transition-all duration-200 hover:border-[var(--border)] hover:bg-black/[0.03]"
                    onClick={handleLogout}
                >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-inset)] text-[var(--text-faint)] transition-all duration-200 group-hover:border-[var(--border)] group-hover:text-[#2a486f]">
                        <LogOut size={18} />
                    </span>
                    <span className="font-medium text-[var(--text-muted)]">Logout</span>
                </button>
            </div>
        </>
    );

    return (
        <aside className="relative w-full border-b border-[var(--border)] bg-[var(--bg-surface)] md:w-[248px] md:shrink-0 md:border-b-0 rounded-tl-[44px]">
            {/* <div className="absolute bottom-0 left-0 h-40 w-36 rounded-tr-[44px] bg-[radial-gradient(circle_at_20%_70%,rgba(73,112,164,0.28),rgba(73,112,164,0.02)_58%),radial-gradient(circle_at_70%_90%,rgba(92,59,141,0.24),rgba(92,59,141,0.02)_54%)]" /> */}

            <div className="relative flex items-center justify-between px-5 py-4 sm:px-6 md:hidden">
                <Link href="/account/dashboard" className="inline-flex items-center">
                    <Image
                        src="/assets/Logo.svg"
                        alt="Ethnic Infotech"
                        width={188}
                        height={62}
                        priority
                        className="h-auto w-[140px]"
                    />
                </Link>

                <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-selected)] text-[var(--text-strong)] transition hover:border-[var(--accent)] hover:bg-[var(--bg-selected)]"
                    aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                >
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {isMobileMenuOpen && (
                <div className="relative border-t border-[var(--border)] px-5 pb-5 pt-4 sm:px-6 xl:hidden">
                    <div className="flex min-h-0 flex-col">
                        {sidebarContent}
                    </div>
                </div>
            )}

            <div className="relative hidden h-full flex-col px-5 py-6 sm:px-6 md:flex md:min-h-[calc(100vh-48px)] md:px-6 md:py-7">
                {sidebarContent}
            </div>
        </aside>
    );
}

export default Sidebar;
