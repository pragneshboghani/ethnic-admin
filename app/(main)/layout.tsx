import type { Metadata } from "next";
import "../globals.css";
import LayoutContainer from "@/components/common/LayoutContainer";
import { BaseMetadata } from "@/components/common/baseMetadata";

export const metadata: Metadata = {
  ...BaseMetadata
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LayoutContainer>
      <div className="w-full h-full m-auto">
        <div className="max-w-full w-full h-full p-0 flex items-start justify-start">
          <main className="max-w-full w-full h-full min-h-screen sticky top-0">
            <div className="page-wrapper max-w-full w-full h-full relative">
              {children}
            </div>
          </main>
        </div>
      </div>
    </LayoutContainer>
  );
}
