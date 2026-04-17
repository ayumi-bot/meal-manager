'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MealRecord } from '@/types'
import Navigation from '@/components/Navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MEAL_LABELS = {
  breakfast: '朝食',
  lunch: '昼食',
  dinner: '夕食',
  snack: '間食',
}

export default function HistoryPage() {
  const [records, setRecords] = useState<MealRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [offset, setOffset] = useState(0)

  const date = new Date()
  date.setDate(date.getDate() - offset)
  const dateStr = date.toISOString().split('T')[0]
  const dateLabel = date.toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  })

  useEffect(() => {
    setLoading(true)
    supabase
      .from('meal_records')
      .select('*, food_item:food_items(*)')
      .eq('date', dateStr)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setRecords(data || [])
        setLoading(false)
      })
  }, [dateStr])

  const totals = records.reduce(
    (acc, r) => ({
      calories: acc.calories + r.calories,
      protein: acc.protein + r.protein,
      fat: acc.fat + r.fat,
      carbs: acc.carbs + r.carbs,
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  )

  const groups = (['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => ({
    type,
    label: MEAL_LABELS[type],
    records: records.filter((r) => r.meal_type === type),
  }))

  return (
    <div className="max-w-lg mx-auto pb-20">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-slate-800 mb-4">履歴</h1>
        {/* Date navigation */}
        <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 border border-slate-100 shadow-sm">
          <button onClick={() => setOffset(o => o + 1)} className="text-slate-400 hover:text-slate-600">
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium text-slate-700">{dateLabel}</span>
          <button
            onClick={() => setOffset(o => Math.max(0, o - 1))}
            disabled={offset === 0}
            className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-300">読み込み中...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-10 text-slate-300">この日の記録はありません</div>
      ) : (
        <div className="px-4 space-y-4">
          {/* Day summary */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm grid grid-cols-4 text-center">
            <div>
              <p className="text-xs text-slate-400">カロリー</p>
              <p className="font-bold text-emerald-600">{Math.round(totals.calories)}</p>
              <p className="text-xs text-slate-400">kcal</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">P</p>
              <p className="font-bold text-blue-500">{Math.round(totals.protein)}g</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">F</p>
              <p className="font-bold text-yellow-500">{Math.round(totals.fat)}g</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">C</p>
              <p className="font-bold text-orange-500">{Math.round(totals.carbs)}g</p>
            </div>
          </div>

          {groups.map(({ type, label, records: mealRecords }) =>
            mealRecords.length === 0 ? null : (
              <div key={type} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex justify-between items-center px-4 py-3 border-b border-slate-50">
                  <h2 className="font-semibold text-slate-700">{label}</h2>
                  <span className="text-sm text-slate-400">
                    {Math.round(mealRecords.reduce((s, r) => s + r.calories, 0))} kcal
                  </span>
                </div>
                <div className="divide-y divide-slate-50">
                  {mealRecords.map((r) => (
                    <div key={r.id} className="px-4 py-2.5 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{r.food_item?.name}</p>
                        <p className="text-xs text-slate-400">{r.quantity_g}g</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-600">
                        {Math.round(r.calories)} kcal
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}

      <Navigation />
    </div>
  )
}
