'use client'

interface NutrientBarProps {
  label: string
  current: number
  goal: number
  unit: string
  color: string
}

export default function NutrientBar({ label, current, goal, unit, color }: NutrientBarProps) {
  const percent = Math.min((current / goal) * 100, 100)
  const over = current > goal

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className={over ? 'text-red-500 font-medium' : 'text-slate-700'}>
          {Math.round(current)}<span className="text-slate-400">/{goal}{unit}</span>
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${over ? 'bg-red-400' : color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
