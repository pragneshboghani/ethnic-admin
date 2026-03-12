const LayoutContainer = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
    containerClassname?: string;
}>) => {
   
    return (
        <html lang="en">
            <body className={`bg-primary text-white min-h-screen overflow-x-hidden`}>
                    {children}
            </body>
        </html>
    );
}

export default LayoutContainer;