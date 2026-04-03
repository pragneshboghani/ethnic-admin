const LayoutContainer = ({
    children,
}: Readonly<{
    children: React.ReactNode;
    containerClassname?: string;
}>) => {
   
    return (
        <html lang="en">
            <body className="min-h-screen overflow-x-hidden bg-[#0b1018] text-white">
                    {children}
            </body>
        </html>
    );
}

export default LayoutContainer;
