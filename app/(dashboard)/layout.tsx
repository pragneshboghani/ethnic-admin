import "../globals.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import LayoutContainer from "@/components/common/LayoutContainer";
import ParticlesBackground from "@/components/common/ParticlesBackground";


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <LayoutContainer>
      <ParticlesBackground />

        <Header />

        <div className="max-w-full w-full h-full p-0 flex items-start justify-start">
          <Sidebar />

          <main className="max-w-full w-full h-full min-h-screen px-0 pb-6 pt-[135px] sticky top-0">
            <div className="page-wrapper max-w-full w-full h-full p-7.5 relative border border-white/10 bg-white/10 rounded-[30px]">
              {children}
            </div>
          </main>
        </div>
    </LayoutContainer>
  );
}
