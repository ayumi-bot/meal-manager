'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadImage } from '@/lib/upload'
import { MealRecord, UserProfile } from '@/types'
import NutrientBar from '@/components/NutrientBar'
import Navigation from '@/components/Navigation'
import { IllustBowl, IllustSalad, IllustApple, IllustDumbbell, IllustHeart, IllustPlate } from '@/components/FoodIllustrations'
import Link from 'next/link'
import { PlusCircle, Flame, Dumbbell, Trash2, Camera, ImageIcon } from 'lucide-react'

const MEAL_LABELS = {
  breakfast: '🌅 朝食',
  lunch: '☀️ 昼食',
  dinner: '🌙 夕食',
  snack: '🍎 間食',
}
const MEAL_COLORS = {
  breakfast: 'from-amber-400 to-orange-400',
  lunch: 'from-emerald-400 to-teal-400',
  dinner: 'from-violet-400 to-purple-400',
  snack: 'from-pink-400 to-rose-400',
}
const ACTIVITY_LABELS = {
  sedentary: 'デスクワーク中心',
  light: '軽い運動',
  moderate: '適度な運動',
  active: 'ハードな運動',
  very_active: '毎日激しく運動',
}

function bmi(h: number, w: number) { return (w / ((h / 100) ** 2)).toFixed(1) }
function bmiLabel(b: number) {
  if (b < 18.5) return { text: '低体重', color: 'text-blue-500' }
  if (b < 25)   return { text: '標準', color: 'text-emerald-500' }
  if (b < 30)   return { text: '過体重', color: 'text-amber-500' }
  return { text: '肥満', color: 'text-red-500' }
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile & { avatar_url?: string; bg_image_url?: string } | null>(null)
  const [records, setRecords] = useState<MealRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingBg, setUploadingBg] = useState(false)
  const avatarRef = useRef<HTMLInputElement>(null)
  const bgRef = useRef<HTMLInputElement>(null)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    async function load() {
      const { data: profileData } = await supabase.from('profiles').select('*').limit(1).single()
      if (!profileData) { window.location.href = '/setup'; return }
      setProfile(profileData)
      const { data: recordData } = await supabase
        .from('meal_records').select('*, food_item:food_items(*)')
        .eq('date', today).order('created_at', { ascending: true })
      setRecords(recordData || [])
      setLoading(false)
    }
    load()
  }, [today])

  async function handleDelete(id: string) {
    await supabase.from('meal_records').delete().eq('id', id)
    setRecords((prev) => prev.filter((r) => r.id !== id))
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploadingAvatar(true)
    const url = await uploadImage(file, `avatar_${profile.id}`)
    if (url) {
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', profile.id)
      setProfile((p) => p ? { ...p, avatar_url: url } : p)
    }
    setUploadingAvatar(false)
  }

  async function handleBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploadingBg(true)
    const url = await uploadImage(file, `bg_${profile.id}`)
    if (url) {
      await supabase.from('profiles').update({ bg_image_url: url }).eq('id', profile.id)
      setProfile((p) => p ? { ...p, bg_image_url: url } : p)
    }
    setUploadingBg(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="text-emerald-400 animate-pulse text-lg font-medium">読み込み中...</div>
    </div>
  )

  const totals = records.reduce(
    (acc, r) => ({ calories: acc.calories + r.calories, protein: acc.protein + r.protein, fat: acc.fat + r.fat, carbs: acc.carbs + r.carbs, fiber: acc.fiber + r.fiber }),
    { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 }
  )
  const mealGroups = (['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => ({
    type, label: MEAL_LABELS[type], color: MEAL_COLORS[type],
    records: records.filter((r) => r.meal_type === type),
  }))
  const dateStr = new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })
  const calorieGoal = profile?.daily_calorie_goal || 1
  const caloriePercent = Math.min((totals.calories / calorieGoal) * 100, 100)
  const remaining = calorieGoal - Math.round(totals.calories)
  const b = profile ? Number(bmi(profile.height_cm, profile.weight_kg)) : 0
  const bmiInfo = bmiLabel(b)

  return (
    <div className="max-w-lg mx-auto pb-24 min-h-screen relative overflow-x-hidden"
      style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 40%, #f0fdfa 70%, #eff6ff 100%)' }}>

      {/* ===== 固定背景イラスト（画面全体に広がる）===== */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">

        {/* ── 左サイド ── */}
        <IllustBowl   style={{ position: 'absolute', width: 140, top: '8%',  left: '2vw',  transform: 'rotate(-10deg)', opacity: 0.55 } as React.CSSProperties} />
        <IllustSalad  style={{ position: 'absolute', width: 120, top: '32%', left: '1vw',  transform: 'rotate(8deg)',  opacity: 0.5  } as React.CSSProperties} />
        <IllustPlate  style={{ position: 'absolute', width: 110, top: '58%', left: '2vw',  transform: 'rotate(-6deg)', opacity: 0.45 } as React.CSSProperties} />
        <IllustHeart  style={{ position: 'absolute', width: 70,  top: '80%', left: '4vw',  transform: 'rotate(5deg)',  opacity: 0.4  } as React.CSSProperties} />

        {/* ── 右サイド ── */}
        <IllustApple  style={{ position: 'absolute', width: 100, top: '6%',  right: '2vw', transform: 'rotate(12deg)', opacity: 0.55 } as React.CSSProperties} />
        {profile?.is_muscle_training
          ? <IllustDumbbell style={{ position: 'absolute', width: 120, top: '28%', right: '1vw', transform: 'rotate(-8deg)', opacity: 0.5 } as React.CSSProperties} />
          : <IllustBowl     style={{ position: 'absolute', width: 110, top: '30%', right: '1vw', transform: 'rotate(15deg)', opacity: 0.45 } as React.CSSProperties} />
        }
        <IllustSalad  style={{ position: 'absolute', width: 105, top: '55%', right: '2vw', transform: 'rotate(-10deg)', opacity: 0.45 } as React.CSSProperties} />
        <IllustHeart  style={{ position: 'absolute', width: 65,  top: '78%', right: '3vw', transform: 'rotate(-5deg)', opacity: 0.4  } as React.CSSProperties} />

        {/* ── カラフル小丸デコ（左右に分散）── */}
        {[
          { top: '3%',  left: '18vw', size: 12, color: '#fbbf24' },
          { top: '15%', left: '8vw',  size: 9,  color: '#f472b6' },
          { top: '45%', left: '6vw',  size: 11, color: '#38bdf8' },
          { top: '68%', left: '12vw', size: 8,  color: '#fb923c' },
          { top: '90%', left: '7vw',  size: 10, color: '#4ade80' },
          { top: '10%', right: '10vw', size: 10, color: '#34d399' },
          { top: '25%', right: '6vw',  size: 8,  color: '#818cf8' },
          { top: '50%', right: '8vw',  size: 12, color: '#f472b6' },
          { top: '72%', right: '12vw', size: 9,  color: '#fbbf24' },
          { top: '88%', right: '5vw',  size: 11, color: '#4ade80' },
        ].map((d, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              top: d.top,
              left: (d as {left?: string}).left,
              right: (d as {right?: string}).right,
              width: d.size, height: d.size,
              background: d.color,
              opacity: 0.45,
            }} />
        ))}
      </div>

      {/* ===== ヘッダー（背景画像対応）===== */}
      <div className="relative overflow-hidden text-white" style={{ minHeight: 140 }}>
        {/* 背景：アップロード画像 or グラデーション */}
        {profile?.bg_image_url ? (
          <img src={profile.bg_image_url} alt="背景" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500" />
        )}
        <div className="absolute inset-0 bg-black/20" />
        {/* デコ丸 */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10 px-5 pt-10 pb-16">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">{dateStr}</p>
              <h1 className="text-2xl font-bold">今日の食事</h1>
            </div>
            {/* 背景画像変更ボタン */}
            <button onClick={() => bgRef.current?.click()}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-2 transition-colors">
              {uploadingBg ? (
                <div className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
              ) : (
                <ImageIcon size={18} />
              )}
            </button>
            <input ref={bgRef} type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
          </div>
        </div>
      </div>

      {/* ===== カロリーカード ===== */}
      <div className="mx-4 -mt-10 relative z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-xl shadow-emerald-100/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">摂取カロリー</p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-black text-slate-800">{Math.round(totals.calories)}</span>
                <span className="text-slate-400 mb-1">kcal</span>
              </div>
            </div>
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                <circle cx="40" cy="40" r="32" fill="none"
                  stroke={totals.calories > calorieGoal ? '#f87171' : '#10b981'}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - caloriePercent / 100)}`}
                  className="transition-all duration-700" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Flame size={14} className={totals.calories > calorieGoal ? 'text-red-400' : 'text-emerald-500'} />
                <span className="text-xs font-bold text-slate-600">{Math.round(caloriePercent)}%</span>
              </div>
            </div>
          </div>
          <div className={`text-xs font-medium mb-4 ${remaining >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {remaining >= 0 ? `あと ${remaining} kcal` : `${Math.abs(remaining)} kcal オーバー`}
            <span className="text-slate-400 font-normal"> / 目標 {calorieGoal} kcal</span>
          </div>
          <div className="space-y-2.5">
            <NutrientBar label="タンパク質" current={totals.protein} goal={profile?.daily_protein_goal || 0} unit="g" color="bg-gradient-to-r from-blue-400 to-indigo-400" />
            <NutrientBar label="脂質" current={totals.fat} goal={profile?.daily_fat_goal || 0} unit="g" color="bg-gradient-to-r from-amber-400 to-yellow-400" />
            <NutrientBar label="炭水化物" current={totals.carbs} goal={profile?.daily_carbs_goal || 0} unit="g" color="bg-gradient-to-r from-orange-400 to-red-400" />
            <NutrientBar label="食物繊維" current={totals.fiber} goal={20} unit="g" color="bg-gradient-to-r from-green-400 to-emerald-400" />
          </div>
          {profile?.is_muscle_training && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-violet-600 bg-violet-50 rounded-xl px-3 py-1.5">
              <Dumbbell size={12} />
              筋トレモード：タンパク質目標 {profile.daily_protein_goal}g
            </div>
          )}
        </div>
      </div>

      {/* ===== プロフィールカード ===== */}
      {profile && (
        <div className="mx-4 mt-4 relative z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* アバター */}
                <button onClick={() => avatarRef.current?.click()}
                  className="relative w-10 h-10 rounded-full overflow-hidden bg-white/20 flex items-center justify-center shrink-0 hover:ring-2 hover:ring-white/60 transition-all">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">👤</span>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5">
                    <Camera size={8} className="text-indigo-500" />
                  </div>
                </button>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                <span className="font-bold text-white text-sm">プロフィール</span>
              </div>
              <Link href="/setup" className="text-white/70 hover:text-white text-xs underline">編集</Link>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { label: '身長', value: `${profile.height_cm}`, unit: 'cm', emoji: '📏' },
                  { label: '体重', value: `${profile.weight_kg}`, unit: 'kg', emoji: '⚖️' },
                  { label: '年齢', value: `${profile.age}`, unit: '歳', emoji: '🎂' },
                  { label: '性別', value: profile.gender === 'male' ? '男性' : '女性', unit: '', emoji: profile.gender === 'male' ? '♂️' : '♀️' },
                ].map(({ label, value, unit, emoji }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-2 text-center">
                    <div className="text-base mb-0.5">{emoji}</div>
                    <p className="text-xs text-slate-400 leading-none">{label}</p>
                    <p className="font-bold text-slate-700 text-sm leading-snug">{value}<span className="text-xs font-normal text-slate-400">{unit}</span></p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mb-2">
                <div className="flex-1 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl px-3 py-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">BMI</p>
                    <p className="font-black text-slate-700 text-lg leading-tight">{b}</p>
                  </div>
                  <span className={`text-xs font-bold ${bmiInfo.color}`}>{bmiInfo.text}</span>
                </div>
                <div className="flex-1 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl px-3 py-2">
                  <p className="text-xs text-slate-400">活動レベル</p>
                  <p className="text-xs font-semibold text-slate-700 leading-snug mt-0.5">
                    {ACTIVITY_LABELS[profile.activity_level]}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'P目標', value: profile.daily_protein_goal, unit: 'g', color: 'text-blue-500' },
                  { label: 'F目標', value: profile.daily_fat_goal, unit: 'g', color: 'text-amber-500' },
                  { label: 'C目標', value: profile.daily_carbs_goal, unit: 'g', color: 'text-orange-500' },
                ].map(({ label, value, unit, color }) => (
                  <div key={label} className="bg-slate-50 rounded-xl px-2 py-1.5 text-center">
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className={`font-bold text-sm ${color}`}>{value}<span className="text-xs font-normal text-slate-400">{unit}</span></p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 食事グループ ===== */}
      <div className="px-4 mt-4 space-y-3 relative z-10">
        {mealGroups.map(({ type, label, color, records: mealRecords }) => (
          <div key={type} className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm">
            <div className={`bg-gradient-to-r ${color} px-4 py-2.5 flex justify-between items-center`}>
              <h2 className="font-bold text-white text-sm">{label}</h2>
              <span className="text-white/90 text-xs font-medium">
                {Math.round(mealRecords.reduce((s, r) => s + r.calories, 0))} kcal
              </span>
            </div>
            {mealRecords.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-300">未記録</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {mealRecords.map((r) => (
                  <div key={r.id} className="px-4 py-2.5 flex justify-between items-center group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700">{r.food_item?.name}</p>
                      <p className="text-xs text-slate-400">
                        {r.quantity_g}g · P{Math.round(r.protein)}g F{Math.round(r.fat)}g C{Math.round(r.carbs)}g
                        {r.cost ? ` · ¥${r.cost}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <p className="text-sm font-bold text-slate-600">{Math.round(r.calories)} kcal</p>
                      <button onClick={() => handleDelete(r.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-300 hover:text-red-400">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FAB */}
      <Link href="/record"
        className="fixed right-5 bottom-24 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-full p-4 shadow-xl shadow-emerald-200 hover:scale-105 transition-transform z-20">
        <PlusCircle size={26} />
      </Link>

      <Navigation />
    </div>
  )
}
