
interface ProgressBarProps {
  completionPercentage: number;
}

export default function EnrichedProgressBar({ completionPercentage }: ProgressBarProps) {

  const steps = [
    { label: "Infos de base", percentage: 20 },
    { label: "Études", percentage: 40 },
    { label: "Expérience", percentage: 60 },
    { label: "Compétences", percentage: 80 },
    { label: "Documents", percentage: 100 },
  ];

  return (
    <div className="mb-6 rounded-xl border border-border/70 bg-background/50 p-5 space-y-4">
      {/* 5 étapes visuelles */}
      <div className="flex gap-2">
        {steps.map((step, index) => (
          <div key={step.label} className="flex-1 flex flex-col items-center gap-2">
            <div
              className={`size-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                completionPercentage >= step.percentage
                  ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg"
                  : "bg-muted text-muted-foreground border border-border/70"
              }`}
            >
              {index + 1}
            </div>
            <span className="text-xs font-medium text-muted-foreground text-center leading-tight">{step.label}</span>
          </div>
        ))}
      </div>

      {/* Connecteur */}
      <div className="h-1 rounded-full bg-muted/50 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-300"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
    </div>
  );
}
