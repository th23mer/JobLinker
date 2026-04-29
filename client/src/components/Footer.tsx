import { useTranslation } from "@/hooks/useTranslation";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} JobLinker. {t("tousDroits")}
        </p>
      </div>
    </footer>
  );
}
