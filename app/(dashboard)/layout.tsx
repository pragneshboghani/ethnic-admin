"use client";

import "../globals.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import LayoutContainer from "@/components/common/LayoutContainer";
import ParticlesBackground from "@/components/common/ParticlesBackground";
import { navItems } from "@/utils/navItems";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const activeTab = navItems.find((item) =>
    pathname.startsWith(item.href)
  );

  const ShowHeader = (pathname == "/account/dashboard" || pathname == '/account/blogs' || pathname == '/account/plateforms' || pathname == '/account/media') ? true : false

  return (
    <LayoutContainer>
      <div className="App">
        {/* <ParticlesBackground /> */}
        <Header />
        <div className="max-w-full w-full h-full p-0 flex items-start justify-start px-15">
          <Sidebar />
          <main className="w-full px-0 pb-6 ml-10 mt-[145px]">
            <div className="text-white">
              {ShowHeader &&
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-3xl font-semibold">{activeTab?.name}</h1>
                    <p className="text-gray-400 text-sm">
                      Manage your multi-platform content strategy.
                    </p>
                  </div>

                  <Link
                    href="/account/blogs/add"
                    className="btn btn-primary"
                  >
                    + Create Blog
                  </Link>
                </div>
              }

              {children}
            </div>
          </main>
        </div>
      </div>
    </LayoutContainer>
  );
}
