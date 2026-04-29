import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SkillsManagerProps {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
  disabled?: boolean;
}

export default function SkillsManager({ skills, onSkillsChange, disabled }: SkillsManagerProps) {
  const [input, setInput] = useState("");

  const addSkill = () => {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onSkillsChange([...skills, trimmed]);
      setInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onSkillsChange(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Ajouter une compétence..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          className="flex-1"
        />
        <Button
          size="sm"
          onClick={addSkill}
          disabled={!input.trim() || disabled}
          className="gap-2"
        >
          <Plus className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Ajouter</span>
        </Button>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/30 border border-border/50 min-h-[44px] items-center">
          {skills.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="pl-2.5 pr-1.5 py-1 rounded-full group cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors"
            >
              {skill}
              <button
                onClick={() => removeSkill(skill)}
                className="ml-1.5 opacity-70 hover:opacity-100 transition-opacity"
                aria-label={`Supprimer ${skill}`}
                disabled={disabled}
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
