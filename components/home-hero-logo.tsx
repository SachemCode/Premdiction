import { BrandLogo } from "@/components/brand-logo"

export function HomeHeroLogo() {
  return (
    <div className="mb-6 flex flex-col items-center gap-3">
      <BrandLogo
        variant="full"
        source="sphere"
        priority
        className="h-44 w-44 sm:h-52 sm:w-52 dark:brightness-110 dark:drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
      />
      <span className="text-2xl sm:text-3xl font-bold tracking-[0.2em] text-pl-purple dark:text-white">
        PREMDICTION
      </span>
    </div>
  )
}
