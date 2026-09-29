import { cn } from "@/lib/utils";

type Tone = "neutral" | "info" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-accent text-accent-foreground",
  success: "bg-success/12 text-success",
  warning: "bg-warning/18 text-warning-foreground",
  danger: "bg-destructive/12 text-destructive",
};

const map: Record<string, { label: string; tone: Tone }> = {
  ACTIF: { label: "Actif", tone: "success" },
  INACTIF: { label: "Inactif", tone: "neutral" },
  ARCHIVE: { label: "Archivé", tone: "neutral" },
  PROSPECT: { label: "Prospect", tone: "info" },
  DEMANDE: { label: "Demandé", tone: "warning" },
  DEPOSE: { label: "Déposé", tone: "info" },
  EN_REVUE: { label: "En revue", tone: "warning" },
  VALIDE: { label: "Validé", tone: "success" },
  REJETE: { label: "Rejeté", tone: "danger" },
  A_FAIRE: { label: "À faire", tone: "neutral" },
  EN_COURS: { label: "En cours", tone: "info" },
  EN_VALIDATION: { label: "En validation", tone: "warning" },
  TERMINE: { label: "Terminé", tone: "success" },
  BASSE: { label: "Basse", tone: "neutral" },
  NORMALE: { label: "Normale", tone: "info" },
  HAUTE: { label: "Haute", tone: "warning" },
  URGENTE: { label: "Urgente", tone: "danger" },
};

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  const entry = map[value] ?? { label: value, tone: "neutral" as Tone };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        tones[entry.tone],
        className,
      )}
    >
      {entry.label}
    </span>
  );
}
