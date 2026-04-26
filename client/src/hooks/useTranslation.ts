import { useLanguage } from "@/context/LanguageContext";
import { translations, type TranslationKey } from "@/lib/translations";

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.fr[key];
  };

  return { t, language };
}
