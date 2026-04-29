import { useState } from "react";
import { ChevronDown, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionAccordionProps {
  title: string;
  children: React.ReactNode;
  status?: "complete" | "partial" | "empty";
  defaultOpen?: boolean;
}

export default function SectionAccordion({ title, children, status = "empty", defaultOpen = false }: SectionAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  const statusConfig = {
    complete: { icon: Check, color: "text-emerald-600", bgColor: "bg-emerald-100/50", label: "Complet" },
    partial: { icon: AlertCircle, color: "text-amber-600", bgColor: "bg-amber-100/50", label: "Partiellement rempli" },
    empty: { icon: AlertCircle, color: "text-orange-600", bgColor: "bg-orange-100/50", label: "Non renseigné" },
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <div className="rounded-lg border border-border/70 overflow-hidden bg-background/50 hover:bg-background/70 transition-colors">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-muted/20 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 text-left flex-1">
          <div className={cn("size-5 rounded-full flex items-center justify-center shrink-0", config.bgColor)}>
            <IconComponent className={cn("size-4", config.color)} aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className={cn("text-xs font-medium mt-0.5", config.color)}>{config.label}</p>
          </div>
        </div>
        <ChevronDown
          className={cn("size-5 text-muted-foreground transition-transform duration-300 shrink-0 ml-2", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="border-t border-border/50 bg-muted/20 p-4 sm:p-5 animate-scale-in">
          {children}
        </div>
      )}
    </div>
  );
}
