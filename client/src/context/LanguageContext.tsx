import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { translations, type Language } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function detectInitialLanguage(): Language {
  if (typeof window === "undefined") return "fr";

  const params = new URLSearchParams(window.location.search);
  const paramLang = params.get("lang")?.toLowerCase();
  if (paramLang === "fr" || paramLang === "en") return paramLang;

  const stored = localStorage.getItem("joblinker-language");
  if (stored === "fr" || stored === "en") return stored;

  if (navigator.language.toLowerCase().startsWith("en")) return "en";

  return "fr";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectInitialLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("joblinker-language", lang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const entry = translations[key];
      if (!entry) return key;
      return entry[language] || entry.fr || key;
    },
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be inside LanguageProvider");
  return ctx;
}
