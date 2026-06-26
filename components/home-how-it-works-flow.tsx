import { ArrowDown, ArrowRight, CheckCircle, Star, Trophy } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type Step = {
  step: number
  title: string
  icon: LucideIcon
  iconColor: string
  iconBg: string
}

const steps: Step[] = [
  {
    step: 1,
    title: "Predict Scores",
    icon: CheckCircle,
    iconColor: "text-pl-purple",
    iconBg: "bg-pl-purple/10",
  },
  {
    step: 2,
    title: "Earn Points",
    icon: Star,
    iconColor: "text-pl-green",
    iconBg: "bg-pl-green/10",
  },
  {
    step: 3,
    title: "Top the Leaderboard",
    icon: Trophy,
    iconColor: "text-pl-cyan",
    iconBg: "bg-pl-cyan/10",
  },
]

function StepCard({ step, title, icon: Icon, iconColor, iconBg }: Step) {
  return (
    <div className="flex flex-col items-center p-6 bg-white dark:bg-pl-purple/20 rounded-xl shadow-md w-full md:flex-1 md:max-w-xs">
      <span className="mb-3 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
        {step}
      </span>
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${iconBg}`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
    </div>
  )
}

export function HomeHowItWorksFlow() {
  return (
    <div className="mt-10 flex w-full max-w-4xl flex-col items-center gap-4 md:flex-row md:items-center md:justify-center md:gap-3">
      {steps.map((step, index) => (
        <div key={step.title} className="contents">
          <StepCard {...step} />
          {index < steps.length - 1 && (
            <>
              <ArrowDown className="h-6 w-6 shrink-0 text-muted-foreground md:hidden" aria-hidden />
              <ArrowRight className="hidden h-6 w-6 shrink-0 text-muted-foreground md:block" aria-hidden />
            </>
          )}
        </div>
      ))}
    </div>
  )
}
