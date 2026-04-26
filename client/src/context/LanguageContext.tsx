import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Language = "fr" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("fr");

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem("joblinker-language");
    if (storedLanguage === "fr" || storedLanguage === "en") {
      setLanguageState(storedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    window.localStorage.setItem("joblinker-language", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
