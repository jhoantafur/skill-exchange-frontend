import { cn } from "@/lib/utils"

const CATEGORY_LABELS = {
  technical:            "Technical",
  creative:             "Creative",
  communication:        "Communication",
  leadership:           "Leadership",
  business:             "Business",
  personal_development: "Personal development",
  other:                "Other",
}

const LEVEL_STYLES = {
  beginner:     "bg-green-50 text-green-700 border-green-200",
  intermediate: "bg-blue-50 text-blue-700 border-blue-200",
  advanced:     "bg-orange-50 text-orange-700 border-orange-200",
  expert:       "bg-purple-50 text-purple-700 border-purple-200",
}

const LEVEL_LABELS = {
  beginner:     "Beginner",
  intermediate: "Intermediate",
  advanced:     "Advanced",
  expert:       "Expert",
}

export function SkillCard({ skill, onClick }) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      className={cn(
        "rounded-lg border border-border p-4 bg-background space-y-1 transition-all",
        onClick && "cursor-pointer hover:shadow-md hover:border-foreground/20 active:scale-[0.99]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-sm leading-tight">{skill.name}</p>
        {skill.level && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full border shrink-0",
              LEVEL_STYLES[skill.level] ?? "bg-muted text-muted-foreground border-border"
            )}
          >
            {LEVEL_LABELS[skill.level] ?? skill.level}
          </span>
        )}
      </div>
      <span className="text-xs text-muted-foreground">
        {CATEGORY_LABELS[skill.category] ?? skill.category}
      </span>
    </div>
  )
}
