import { AlertCircle } from "lucide-react";

interface ProfileCompletionBannerProps {
  completionPercentage: number;
}

export default function ProfileCompletionBanner({ completionPercentage }: ProfileCompletionBannerProps) {
  if (completionPercentage === 100) return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/50 p-4 sm:p-5">
      <div className="flex gap-4">
        <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 mb-2">Profil incomplet</h3>
          <p className="text-sm text-amber-800 mb-3">
            Compléter votre profil augmente vos chances d'être contacté par les recruteurs.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-amber-200/50 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-amber-900 ws-nowrap">{completionPercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
