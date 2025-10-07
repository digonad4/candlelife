import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

type Theme = "supabase" | "dark" | "light" | "system";

interface UnifiedThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => Promise<void>;
  isUpdating: boolean;
  appliedTheme: Theme;
}

const UnifiedThemeContext = createContext<UnifiedThemeContextType>({
  theme: "supabase",
  setTheme: async () => {},
  isUpdating: false,
  appliedTheme: "supabase",
});

export const useUnifiedTheme = () => {
  const context = useContext(UnifiedThemeContext);
  if (context === undefined) {
    throw new Error("useUnifiedTheme must be used within a UnifiedThemeProvider");
  }
  return context;
};

export const UnifiedThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>("supabase");
  const [isUpdating, setIsUpdating] = useState(false);
  const [appliedTheme, setAppliedTheme] = useState<Theme>(theme);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    const defaultTheme: Theme = "supabase";
    
    if (!savedTheme) {
      setThemeState(defaultTheme);
      localStorage.setItem("theme", defaultTheme);
    } else {
      setThemeState(savedTheme);
    }
  }, []);

  // Load user's theme from database
  useEffect(() => {
    const loadUserTheme = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_themes')
            .select('theme_name')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (error) {
            console.error("Error loading user theme:", error);
            return;
          }
          
          if (data && data.theme_name) {
            const userTheme = data.theme_name as Theme;
            setThemeState(userTheme);
            localStorage.setItem("theme", userTheme);
          } else {
            // First login - create default theme
            await supabase
              .from('user_themes')
              .insert({
                user_id: user.id,
                theme_name: "supabase",
                updated_at: new Date().toISOString()
              });
            setThemeState("supabase");
            localStorage.setItem("theme", "supabase");
          }
        } catch (error) {
          console.error("Error loading user theme:", error);
        }
      }
    };

    if (user) {
      loadUserTheme();
    }
  }, [user]);

  // Resolve system theme
  const resolveTheme = useCallback((currentTheme: Theme): Theme => {
    if (currentTheme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return currentTheme;
  }, []);

  // Apply theme
  useEffect(() => {
    const resolved = resolveTheme(theme);
    setAppliedTheme(resolved);
    
    document.documentElement.className = document.documentElement.className
      .replace(/\bdark\b/g, '')
      .replace(/\blight\b/g, '')
      .trim();
    
    document.documentElement.setAttribute("data-theme", resolved);
    
    if (resolved === "dark") {
      document.documentElement.classList.add("dark");
    } else if (resolved === "light") {
      document.documentElement.classList.add("light");
    }
  }, [theme, resolveTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        const resolved = resolveTheme(theme);
        setAppliedTheme(resolved);
        
        document.documentElement.className = document.documentElement.className
          .replace(/\bdark\b/g, '')
          .replace(/\blight\b/g, '')
          .trim();
        
        document.documentElement.setAttribute("data-theme", resolved);
        
        if (resolved === "dark") {
          document.documentElement.classList.add("dark");
        } else if (resolved === "light") {
          document.documentElement.classList.add("light");
        }
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme, resolveTheme]);

  // Update theme
  const setTheme = useCallback(async (newTheme: Theme) => {
    setIsUpdating(true);
    
    try {
      setThemeState(newTheme);
      localStorage.setItem("theme", newTheme);
      
      if (user) {
        await supabase
          .from('user_themes')
          .upsert({
            user_id: user.id,
            theme_name: newTheme,
            updated_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error("Error saving theme:", error);
    } finally {
      setIsUpdating(false);
    }
  }, [user]);

  return (
    <UnifiedThemeContext.Provider value={{ theme, setTheme, isUpdating, appliedTheme }}>
      {children}
    </UnifiedThemeContext.Provider>
  );
};
