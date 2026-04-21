"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { LangProvider } from "@/lib/i18n";
import { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem>
      <LangProvider>{children}</LangProvider>
    </NextThemesProvider>
  );
}
