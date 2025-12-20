"use client";

import { ThemeProvider as Provider } from "./ThemeProvider";

export default function ClientLayout({
    children,
    navbar
}: {
    children: React.ReactNode;
    navbar: React.ReactNode;
}) {
    return (
        <Provider>
            {navbar}
            <main>{children}</main>
        </Provider>
    );
}
