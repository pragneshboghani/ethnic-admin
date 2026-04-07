"use client";

import UserActions from "@/actions/UserAction";
import Sidebar from "@/components/Sidebar";
import LayoutContainer from "@/components/common/LayoutContainer";
import { UserProvider } from "@/context/UserContext";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
        "/account/plateforms": {
            eyebrow: "Distribution",
            title: "Platforms",
            description:
                "Manage publishing destinations and keep your platform connections ready.",
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
    };

    const currentHeader = pageHeaders[pathname];

    return (
        <UserProvider>
            <LayoutContainer>
                <div className={`${dashboardFont.className} min-h-screen bg-[radial-gradient(circle_at_top_center,_rgba(53,75,115,0.22),_transparent_26%),radial-gradient(circle_at_top_left,_rgba(73,112,164,0.22),_transparent_22%),radial-gradient(circle_at_bottom_left,_rgba(92,59,141,0.18),_transparent_20%),linear-gradient(180deg,#0b1018_0%,#0e1622_52%,#091019_100%)] px-3 pb-3 pt-2 sm:px-4 sm:pb-4 sm:pt-3 lg:px-6 lg:pb-6 lg:pt-4`}>
                    <ToastContainer
                        position="top-right"
                        autoClose={3200}
                        closeOnClick
                        pauseOnHover
                        draggable
                        hideProgressBar={false}
                        newestOnTop
                        theme="dark"
                        className="dashboard-toast-container"
                        toastClassName={(context) =>
                            `${context?.defaultClassName || ""} dashboard-toast dashboard-toast--${context?.type || "default"}`
                        }
                        progressClassName={(context) =>
                            `${context?.defaultClassName || ""} dashboard-toast-progress dashboard-toast-progress--${context?.type || "default"}`
                        }
                    />

                    <div className={`${isBlogEditorPage ? "overflow-visible" : "overflow-hidden"} rounded-[28px] border border-white/8 bg-[#0f1724] shadow-[0_30px_90px_rgba(0,0,0,0.42)]`}>
                        <div className="flex flex-col md:flex-row">
                            <Sidebar />

                            <main className={`min-w-0 flex-1 bg-[#111827] px-5 py-6 sm:px-7 lg:px-10 lg:py-8 ${isBlogEditorPage ? "overflow-visible" : ""}`}>
                                <div className="text-[#e6edf7]">
                                    <div className="flex w-full justify-between items-center">
                                        {pathname !== "/account/dashboard" && currentHeader && (
                                            <div className="mb-6 flex flex-col gap-3 lg:mb-7">
                                                <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#8398b5]">
                                                    {currentHeader.eyebrow}
                                                </p>
                                                <div>
                                                    <h1 className="text-3xl font-semibold tracking-tight text-[#eef4ff]">
                                                        {currentHeader.title}
                                                    </h1>
                                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#94a5bd]">
                                                        {currentHeader.description}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {pathname !== "/account/dashboard" && currentHeader?.action && (
                                            <div className="mb-6">
                                                <Link
                                                    href={currentHeader.action.href}
                                                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-[#182235] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#22314a]"
                                                >
                                                    {currentHeader.action.label}
                                                </Link>
                                            </div>
                                        )}
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
