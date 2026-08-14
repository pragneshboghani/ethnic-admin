import { ThemeProvider } from "@/context/ThemeContext";

const THEME_INIT_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )theme=([^;]*)/);var t=m?decodeURIComponent(m[1]):null;if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

const LayoutContainer = ({
    children,
}: Readonly<{
    children: React.ReactNode;
    containerClassname?: string;
}>) => {

    return (
        <html lang="en" suppressHydrationWarning>
            {/* eslint-disable-next-line @next/next/no-head-element -- App Router root layout; next/head is Pages-Router-only and can't hold a blocking pre-hydration script */}
            <head>
                <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
            </head>
            <body
                suppressHydrationWarning
                className="min-h-screen overflow-x-hidden bg-[var(--bg-page)] text-[var(--text-strong)]"
            >
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}

export default LayoutContainer;
