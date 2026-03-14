import ParticlesBackground from "@/components/common/ParticlesBackground";
import { Zap, ArrowRight } from 'lucide-react';
import '../globals.css'
import Header from "@/components/Header";
import Link from "next/link";
import { Features } from "@/utils/Features";


export default function Home() {

  return (
    <div className="App">
      {/* <ParticlesBackground /> */}
      <Header />
      <main className="pt-[105px]">
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            <Zap size={14} />
            Centralized Blog Management
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-[#00D4FF] tracking-tight mb-6 max-w-4xl">
            Write Once, Publish <span className="text-indigo-600">Everywhere.</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl">
            Manage blog content for all your products and websites from a single, powerful admin panel.
            Streamline your workflow, optimize SEO, and reach your audience across multiple platforms.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 group"
            >
              Start Writing
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/account/dashboard"
              className="w-full sm:w-auto bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-8 py-4 rounded-xl font-bold text-lg transition-all"
            >
              View Dashboard
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left max-w-7xl">
            {Features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={index}
                  className="space-y-4 glass-card p-5 flex flex-col items-center"
                >
                  <div
                    className={`w-12 h-12 ${feature.iconBG} rounded-xl flex items-center justify-center`}
                  >
                    <Icon size={24} />
                  </div>

                  <h3 className="text-xl font-bold text-[#00D4FF]">
                    {feature.headingText}
                  </h3>

                  <p className="text-slate-600 text-center">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
