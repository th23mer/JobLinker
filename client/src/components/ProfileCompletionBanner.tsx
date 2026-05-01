import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileCompletionBannerProps {
  completionPercentage: number;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function ProfileCompletionBanner({
  completionPercentage,
  description = "Complétez votre profil pour augmenter vos chances d'être contacté.",
  actionLabel,
  onAction,
}: ProfileCompletionBannerProps) {
  if (completionPercentage === 100) return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/50 p-4 sm:p-5">
      <div className="flex gap-4">
        <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 mb-2">Profil incomplet</h3>
          <p className="text-sm text-amber-800 mb-3">{description}</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-amber-200/50 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-amber-900 ws-nowrap">{completionPercentage}%</span>
          </div>
          {actionLabel && onAction && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onAction}
              className="mt-4 border-amber-600 text-amber-900 hover:bg-amber-100"
            >
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
