"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
            {children}
        </NextThemesProvider>
    );
}
