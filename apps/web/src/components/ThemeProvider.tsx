"use client";

import { useEffect } from "react";

export default function ThemeProvider({ children, season }: { children: React.ReactNode, season: any }) {

  useEffect(() => {
    if (season && season.css_variables) {
      const vars = typeof season.css_variables === "string" ? JSON.parse(season.css_variables) : season.css_variables;
      
      const root = document.documentElement;
      for (const [key, value] of Object.entries(vars)) {
         root.style.setProperty(key, value as string);
         // Dynamically override variables on the client
         if (key === '--primary') {
            root.style.setProperty('--color-primary', value as string);
         }
      }
    }
  }, [season]);

  return <>{children}</>;
}
