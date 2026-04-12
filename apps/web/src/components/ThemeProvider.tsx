"use client";

import { useEffect } from "react";

export default function ThemeProvider({ children, season }: { children: React.ReactNode, season: any }) {

  useEffect(() => {
    if (season && season.css_variables) {
      const vars = typeof season.css_variables === "string" ? JSON.parse(season.css_variables) : season.css_variables;
      
      const root = document.documentElement;
      for (const [key, value] of Object.entries(vars)) {
         root.style.setProperty(key, value as string);
         
         // Special handling for the primary color to update semantic shades
         if (key === '--primary') {
            const hex = value as string;
            root.style.setProperty('--color-primary', hex);
            
            // Set derived shades if not explicitly provided
            root.style.setProperty('--primary-dark', `${hex}dd`); // slightly darker
            root.style.setProperty('--primary-light', `${hex}15`); // very light tint
            root.style.setProperty('--primary-glow', `${hex}25`); // glow effect
         }
      }
    }
  }, [season]);

  return <>{children}</>;
}
