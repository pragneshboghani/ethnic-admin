"use client";

import UserActions from "@/actions/UserAction";
import Sidebar from "@/components/Sidebar";
import LayoutContainer from "@/components/common/LayoutContainer";
import ThemeToggle from "@/components/common/ThemeToggle";
import { UserProvider } from "@/context/UserContext";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../app/globals.css";

const dashboardFont = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const isBlogEditorPage = pathname.startsWith("/account/blogs/add");

    useEffect(() => {
        UserActions.isLogin(router);
    }, [pathname, router]);

    const pageHeaders: Record<
        string,
        {
            eyebrow: string;
            title: string;
            description: string;
            action?: {
                href: string;
                label: string;
            };
        }
    > = {
        "/account/dashboard": {
            eyebrow: "Overview",
            title: "Dashboard",
            description:
                "Track publishing activity, recent blog output, and connected platforms from one place.",
            action: {
                href: "/account/blogs/add",
                label: "Create Blog",
            },
        },
        "/account/blogs": {
            eyebrow: "Content",
            title: "Blogs",
            description:
                "Create, review, and manage your blog content across every connected platform.",
            action: {
                href: "/account/blogs/add",
                label: "New Blog",
            },
        },
        "/account/calendar": {
            eyebrow: "Planning",
            title: "Content Calendar",
            description:
                "Plan social posts per project, see scheduled blogs alongside them, and drag anything to reschedule.",
        },
        "/account/projects": {
            eyebrow: "Planning",
            title: "Projects",
            description:
                "Manage the brands you publish for and the social accounts attached to each one.",
        },
        "/account/plateforms": {
            eyebrow: "Distribution",
            title: "Platforms",
            description:
                "Manage publishing destinations and keep your platform connections ready.",
            action: {
                href: '/account/plateforms/add',
                label: "Add New Platform",
            }
        },
        "/account/media": {
            eyebrow: "Library",
            title: "Media Library",
            description:
                "Keep your media assets organized and ready to use in upcoming posts.",
        },
        "/account/category": {
            eyebrow: "Structure",
            title: "Categories & Tags",
            description:
                "Organize your taxonomy so content is easier to manage and publish.",
        },
        "/account/authors": {
            eyebrow: "Authors",
            title: "Authors",
            description:
                "Manage your authors, their roles, and access permissions.",
        },
        "/account/groups": {
            eyebrow: "Collaboration",
            title: "Groups",
            description:
                "Manage groups, roles, and team collaboration in one place.",
        },
        "/account/resources": {
            eyebrow: "Resources",
            title: "Resource Library",
            description:
                "Upload internal documents, organize them into groups, and keep shared resources easy to access.",
        },
        "/account/comments": {
            eyebrow: "Engagement",
            title: "Comments",
            description:
                "Review and manage reader comments across all your platforms.",
        },
    };

    const currentHeader = pageHeaders[pathname];

    return (
        <UserProvider>
            <LayoutContainer>
                <div className={`${dashboardFont.className} min-h-screen bg-[radial-gradient(circle_at_top_center,_rgba(26,115,232,0.08),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(161,66,244,0.06),_transparent_24%),linear-gradient(180deg,var(--bg-page)_0%,var(--bg-surface-alt)_52%,var(--bg-page)_100%)] px-3 pb-3 pt-2 sm:px-4 sm:pb-4 sm:pt-3 lg:px-6 lg:pb-6 lg:pt-4`}>
                    <ToastContainer
                        position="top-right"
                        autoClose={3200}
                        closeOnClick
                        pauseOnHover
                        draggable
                        hideProgressBar={false}
                        newestOnTop
                        theme="light"
                        className="dashboard-toast-container"
                        toastClassName={(context) =>
                            `${context?.defaultClassName || ""} dashboard-toast dashboard-toast--${context?.type || "default"}`
                        }
                        progressClassName={(context) =>
                            `${context?.defaultClassName || ""} dashboard-toast-progress dashboard-toast-progress--${context?.type || "default"}`
                        }
                    />

                    <div className={`${isBlogEditorPage ? "overflow-visible" : ""} rounded-[28px] border border-[var(--border)] bg-[var(--bg-surface)] shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.06)]`}>
                        <div className="flex flex-col md:flex-row">
                            <div className="flex border-[var(--border)] md:border-r rounded-tl-[44px]">
                                <aside className="sticky top-0 h-screen self-start overflow-y-auto">
                                    <Sidebar />
                                </aside>
                            </div>

                            <main className={`min-w-0 flex-1 px-5 py-6 sm:px-7 rounded-tr-[44px] rounded-br-[44px] lg:px-10 lg:py-8 bg-[var(--bg-surface-alt)] ${isBlogEditorPage ? "overflow-visible" : ""}`}>
                                <div className="text-[var(--text)]">
                                    <div className="flex w-full justify-between items-center flex-wrap">
                                        {pathname !== "/account/dashboard" && currentHeader && (
                                            <div className="flex flex-col gap-3 md:mb-6 lg:mb-7">
                                                <p className={`text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--text-subtle)]`}>
                                                    {currentHeader.eyebrow}
                                                </p>
                                                <div>
                                                    <h1 className={`text-3xl font-semibold tracking-tight text-[var(--text-strong)]`}>
                                                        {currentHeader.title}
                                                    </h1>
                                                    <p className={`mt-2 max-w-2xl text-sm leading-6 hidden md:block text-[var(--text-muted)]`}>
                                                        {currentHeader.description}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="ml-auto flex items-center gap-3 md:mb-6">
                                            {pathname !== "/account/dashboard" && currentHeader?.action && (
                                                <Link
                                                    href={currentHeader.action.href}
                                                    className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium transition bg-[var(--accent)] text-white shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[var(--accent-hover)]`}
                                                >
                                                    {currentHeader.action.label}
                                                </Link>
                                            )}
                                            <ThemeToggle />
                                        </div>

                                        {pathname !== "/account/dashboard" &&
                                            <p className={`mt-2 max-w-2xl text-sm leading-6 mb-6 md:mb-0 inline-flex w-full md:hidden text-[var(--text-muted)]`}>
                                                {currentHeader?.description}
                                            </p>
                                        }
                                    </div>

                                    {children}
                                </div>
                            </main>
                        </div>
                    </div>
                </div>
            </LayoutContainer>
        </UserProvider>
    );
}
