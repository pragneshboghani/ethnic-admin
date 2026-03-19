import "../globals.css";
import 'react-toastify/dist/ReactToastify.css';
import type { Metadata } from "next";
import { BaseMetadata } from "@/components/common/baseMetadata";
import AuthWrapper from "@/components/common/AuthWrapper";

export const metadata: Metadata = {
  ...BaseMetadata
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthWrapper>
      {children}
    </AuthWrapper>
  );
}
