'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { calculateGoals } from '@/lib/nutrition'
import Navigation from '@/components/Navigation'
import { FoodItem } from '@/types'
import { Pencil, Trash2, X, Check } from 'lucide-react'

const activityLabels = {
  sedentary: 'ほぼ動かない（デスクワーク）',
  light: '軽い運動（週1〜2回）',
  moderate: '適度な運動（週3〜4回）',
  active: 'ハードな運動（週5〜6回）',
  very_active: '非常にアクティブ（毎日激しい運動）',
}

export default function SetupPage() {
  const [form, setForm] = useState({
    height_cm: '', weight_kg: '', age: '',
    gender: 'male' as 'male' | 'female',
    activity_level: 'moderate' as keyof typeof activityLabels,
    is_muscle_training: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)

  const [customFoods, setCustomFoods] = useState<FoodItem[]>([])
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null)
  const [editForm, setEditForm] = useState<Partial<FoodItem>>({})

  const set = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }))

  useEffect(() => {
    async function load() {
      const { data: profile } = await supabase.from('profiles').select('*').limit(1).single()
      if (profile) {
        setProfileId(profile.id)
        setForm({
          height_cm: String(profile.height_cm),
          weight_kg: String(profile.weight_kg),
          age: String(profile.age),
          gender: profile.gender,
          activity_level: profile.activity_level,
          is_muscle_training: profile.is_muscle_training,
        })
      }
      const { data: foods } = await supabase
        .from('food_items')
        .select('*')
        .eq('is_custom', true)
        .order('created_at', { ascending: false })
      setCustomFoods(foods || [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const base = {
      height_cm: Number(form.height_cm),
      weight_kg: Number(form.weight_kg),
      age: Number(form.age),
      gender: form.gender,
      activity_level: form.activity_level,
      is_muscle_training: form.is_muscle_training,
    }
    const goals = calculateGoals(base)
    const data = { ...base, ...goals }

    if (profileId) {
      await supabase.from('profiles').update(data).eq('id', profileId)
    } else {
      await supabase.from('profiles').insert(data)
    }
    setSaving(false)
    alert('保存しました！')
  }

  async function handleDeleteFood(id: string) {
    if (!confirm('この食品を削除しますか？')) return
    await supabase.from('food_items').delete().eq('id', id)
    setCustomFoods((f) => f.filter((item) => item.id !== id))
  }

  function startEdit(food: FoodItem) {
    setEditingFood(food)
    setEditForm({
      name: food.name,
      calories_per_100g: food.calories_per_100g,
      protein_per_100g: food.protein_per_100g,
      fat_per_100g: food.fat_per_100g,
      carbs_per_100g: food.carbs_per_100g,
      fiber_per_100g: food.fiber_per_100g,
      sodium_per_100g: food.sodium_per_100g,
    })
  }

  async function handleSaveEdit() {
    if (!editingFood) return
    const { error } = await supabase
      .from('food_items')
      .update(editForm)
      .eq('id', editingFood.id)
    if (!error) {
      setCustomFoods((foods) =>
        foods.map((f) => f.id === editingFood.id ? { ...f, ...editForm } as FoodItem : f)
      )
      setEditingFood(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto pb-24 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-5 pt-10 pb-6 text-white">
        <h1 className="text-xl font-bold">設定</h1>
        <p className="text-slate-300 text-sm">プロフィールと食品管理</p>
      </div>

      <div className="px-4 pt-5 space-y-5">
        {/* Profile form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-700">身体情報</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'height_cm', label: '身長 (cm)', placeholder: '170' },
                { key: 'weight_kg', label: '体重 (kg)', placeholder: '65' },
                { key: 'age', label: '年齢', placeholder: '25' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-slate-400 mb-1 block">{label}</label>
                  <input type="number" required
                    value={form[key as keyof typeof form] as string}
                    onChange={(e) => set(key, e.target.value)}
                    placeholder={placeholder}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                </div>
              ))}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">性別</label>
                <select value={form.gender} onChange={(e) => set('gender', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="font-bold text-slate-700">活動レベル</h2>
            {Object.entries(activityLabels).map(([value, label]) => (
              <label key={value} className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="activity" value={value}
                  checked={form.activity_level === value}
                  onChange={() => set('activity_level', value)}
                  className="accent-emerald-500" />
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.is_muscle_training}
                onChange={(e) => set('is_muscle_training', e.target.checked)}
                className="w-5 h-5 accent-emerald-500" />
              <div>
                <p className="font-semibold text-slate-700">筋トレをしている</p>
                <p className="text-xs text-slate-400">タンパク質目標を体重×2gに設定</p>
              </div>
            </label>
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50">
            {saving ? '保存中...' : 'プロフィールを保存'}
          </button>
        </form>

        {/* Custom foods management */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-4 py-3">
            <h2 className="font-bold text-white">カスタム食品の管理</h2>
            <p className="text-violet-100 text-xs">自分で登録した食品の編集・削除</p>
          </div>

          {customFoods.length === 0 ? (
            <div className="px-4 py-6 text-center text-slate-300 text-sm">
              カスタム食品はまだありません
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {customFoods.map((food) => (
                <div key={food.id}>
                  {editingFood?.id === food.id ? (
                    <div className="px-4 py-3 space-y-2 bg-violet-50/50">
                      <input type="text" value={editForm.name || ''}
                        onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { key: 'calories_per_100g', label: 'kcal' },
                          { key: 'protein_per_100g', label: 'P(g)' },
                          { key: 'fat_per_100g', label: 'F(g)' },
                          { key: 'carbs_per_100g', label: 'C(g)' },
                          { key: 'fiber_per_100g', label: '繊維(g)' },
                          { key: 'sodium_per_100g', label: '塩(g)' },
                        ].map(({ key, label }) => (
                          <div key={key}>
                            <label className="text-xs text-slate-400">{label}</label>
                            <input type="number"
                              value={editForm[key as keyof typeof editForm] as number || 0}
                              onChange={(e) => setEditForm((f) => ({ ...f, [key]: Number(e.target.value) }))}
                              className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-violet-400" />
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingFood(null)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-500">
                          <X size={13} /> キャンセル
                        </button>
                        <button onClick={handleSaveEdit}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-violet-500 text-white rounded-lg text-xs font-medium">
                          <Check size={13} /> 保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{food.name}</p>
                        <p className="text-xs text-slate-400">{food.calories_per_100g} kcal · P{food.protein_per_100g}g F{food.fat_per_100g}g C{food.carbs_per_100g}g</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(food)}
                          className="p-1.5 text-slate-300 hover:text-violet-500 transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDeleteFood(food.id)}
                          className="p-1.5 text-slate-300 hover:text-red-400 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Navigation />
    </div>
  )
}
