'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FoodItem, MealType } from '@/types'
import Navigation from '@/components/Navigation'
import { Search, ChevronLeft, PlusCircle, X, ShoppingBag, Trash2 } from 'lucide-react'
import Link from 'next/link'

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: '🌅 朝食',
  lunch: '☀️ 昼食',
  dinner: '🌙 夕食',
  snack: '🍎 間食',
}

const MEAL_COLORS: Record<MealType, string> = {
  breakfast: 'from-amber-400 to-orange-400',
  lunch: 'from-emerald-400 to-teal-400',
  dinner: 'from-violet-400 to-purple-400',
  snack: 'from-pink-400 to-rose-400',
}

interface CartItem {
  food: FoodItem
  quantity: number
  cost: string
}

const emptyCustom = {
  name: '', calories_per_100g: '', protein_per_100g: '',
  fat_per_100g: '', carbs_per_100g: '', fiber_per_100g: '', sodium_per_100g: '',
}

export default function RecordPage() {
  const [mealType, setMealType] = useState<MealType>('breakfast')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodItem[]>([])
  const [selected, setSelected] = useState<FoodItem | null>(null)
  const [quantity, setQuantity] = useState('100')
  const [cost, setCost] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customForm, setCustomForm] = useState(emptyCustom)
  const [addingCustom, setAddingCustom] = useState(false)

  useEffect(() => {
    supabase.from('profiles').select('id').limit(1).single().then(({ data }) => {
      if (data) setUserId(data.id)
    })
  }, [])

  useEffect(() => {
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('food_items')
        .select('*')
        .ilike('name', query.length > 0 ? `%${query}%` : '%')
        .limit(20)
      setResults(data || [])
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  function addToCart() {
    if (!selected) return
    setCart((c) => [...c, { food: selected, quantity: Number(quantity) || 100, cost }])
    setSelected(null)
    setQuery('')
    setQuantity('100')
    setCost('')
    setResults([])
  }

  function removeFromCart(index: number) {
    setCart((c) => c.filter((_, i) => i !== index))
  }

  async function handleSaveAll() {
    if (cart.length === 0 || !userId) return
    setSaving(true)

    const date = new Date().toISOString().split('T')[0]
    const rows = cart.map(({ food, quantity: qty, cost: c }) => {
      const ratio = qty / 100
      return {
        user_id: userId,
        date,
        meal_type: mealType,
        food_item_id: food.id,
        quantity_g: qty,
        calories: Math.round(food.calories_per_100g * ratio * 10) / 10,
        protein: Math.round(food.protein_per_100g * ratio * 10) / 10,
        fat: Math.round(food.fat_per_100g * ratio * 10) / 10,
        carbs: Math.round(food.carbs_per_100g * ratio * 10) / 10,
        fiber: Math.round(food.fiber_per_100g * ratio * 10) / 10,
        sodium: Math.round(food.sodium_per_100g * ratio * 10) / 10,
        cost: c ? Number(c) : null,
      }
    })

    const { error } = await supabase.from('meal_records').insert(rows)
    if (error) {
      alert('保存に失敗しました: ' + error.message)
    } else {
      window.location.href = '/dashboard'
    }
    setSaving(false)
  }

  async function handleAddCustomFood(e: React.FormEvent) {
    e.preventDefault()
    setAddingCustom(true)

    const { data, error } = await supabase
      .from('food_items')
      .insert({
        name: customForm.name,
        calories_per_100g: Number(customForm.calories_per_100g),
        protein_per_100g: Number(customForm.protein_per_100g) || 0,
        fat_per_100g: Number(customForm.fat_per_100g) || 0,
        carbs_per_100g: Number(customForm.carbs_per_100g) || 0,
        fiber_per_100g: Number(customForm.fiber_per_100g) || 0,
        sodium_per_100g: Number(customForm.sodium_per_100g) || 0,
        is_custom: true,
      })
      .select()
      .single()

    if (!error && data) {
      setSelected(data)
      setQuery(data.name)
      setResults([])
      setShowCustomForm(false)
      setCustomForm(emptyCustom)
    } else {
      alert('登録に失敗しました: ' + error?.message)
    }
    setAddingCustom(false)
  }

  const setCustom = (key: string, value: string) =>
    setCustomForm((f) => ({ ...f, [key]: value }))

  const qty = Number(quantity) || 100
  const ratio = qty / 100
  const preview = selected ? {
    calories: Math.round(selected.calories_per_100g * ratio),
    protein: Math.round(selected.protein_per_100g * ratio * 10) / 10,
    fat: Math.round(selected.fat_per_100g * ratio * 10) / 10,
    carbs: Math.round(selected.carbs_per_100g * ratio * 10) / 10,
  } : null

  const cartTotalCalories = cart.reduce((s, { food, quantity: q }) => s + Math.round(food.calories_per_100g * q / 100), 0)

  return (
    <div className="max-w-lg mx-auto pb-24 min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-emerald-50/20">
      {/* Header */}
      <div className={`bg-gradient-to-r ${MEAL_COLORS[mealType]} px-5 pt-10 pb-6`}>
        <div className="flex items-center gap-3 mb-1">
          <Link href="/dashboard" className="text-white/80 hover:text-white">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-white">食事を記録</h1>
        </div>
      </div>

      <div className="px-4 -mt-1 space-y-4 pt-4">
        {/* Meal type */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-slate-400 mb-3">食事の種類</p>
          <div className="grid grid-cols-4 gap-2">
            {(Object.entries(MEAL_LABELS) as [MealType, string][]).map(([type, label]) => (
              <button
                key={type}
                onClick={() => setMealType(type)}
                className={`py-2 rounded-xl text-xs font-medium transition-all ${
                  mealType === type
                    ? `bg-gradient-to-r ${MEAL_COLORS[type]} text-white shadow-sm`
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Cart */}
        {cart.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className={`bg-gradient-to-r ${MEAL_COLORS[mealType]} px-4 py-2.5 flex justify-between items-center`}>
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <ShoppingBag size={16} />
                追加済み {cart.length}品
              </div>
              <span className="text-white/90 text-xs">{cartTotalCalories} kcal</span>
            </div>
            <div className="divide-y divide-slate-50">
              {cart.map((item, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{item.food.name}</p>
                    <p className="text-xs text-slate-400">
                      {item.quantity}g · {Math.round(item.food.calories_per_100g * item.quantity / 100)} kcal
                    </p>
                  </div>
                  <button onClick={() => removeFromCart(i)} className="text-slate-300 hover:text-red-400 p-1">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">食品を検索して追加</p>
            <button
              onClick={() => { setShowCustomForm(true); setSelected(null) }}
              className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <PlusCircle size={13} />
              新しい食品を登録
            </button>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelected(null) }}
              placeholder="例：コーヒー、ご飯、鶏むね肉..."
              className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {results.length > 0 && !selected && !showCustomForm && (
            <div className="border border-slate-100 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setSelected(item); setQuery(item.name); setResults([]) }}
                  className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 flex justify-between items-center border-b border-slate-50 last:border-0 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-700">{item.name}</span>
                    {item.is_custom && (
                      <span className="text-xs bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full">カスタム</span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">{item.calories_per_100g} kcal/100g</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Custom food form */}
        {showCustomForm && (
          <div className="bg-white rounded-2xl p-4 border-2 border-violet-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-700">新しい食品を登録</h2>
              <button onClick={() => setShowCustomForm(false)} className="text-slate-300 hover:text-slate-500">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddCustomFood} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">食品名 *</label>
                <input type="text" required value={customForm.name}
                  onChange={(e) => setCustom('name', e.target.value)}
                  placeholder="例：自家製プロテインバー"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'calories_per_100g', label: 'カロリー (kcal) *', required: true, placeholder: '200' },
                  { key: 'protein_per_100g', label: 'タンパク質 (g)', required: false, placeholder: '0' },
                  { key: 'fat_per_100g', label: '脂質 (g)', required: false, placeholder: '0' },
                  { key: 'carbs_per_100g', label: '炭水化物 (g)', required: false, placeholder: '0' },
                  { key: 'fiber_per_100g', label: '食物繊維 (g)', required: false, placeholder: '0' },
                  { key: 'sodium_per_100g', label: '塩分 (g)', required: false, placeholder: '0' },
                ].map(({ key, label, required, placeholder }) => (
                  <div key={key}>
                    <label className="text-xs text-slate-400 mb-1 block">{label}</label>
                    <input type="number" required={required}
                      value={customForm[key as keyof typeof customForm]}
                      onChange={(e) => setCustom(key, e.target.value)}
                      placeholder={placeholder}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400">※ 栄養素はすべて100gあたりの値</p>
              <button type="submit" disabled={addingCustom}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                {addingCustom ? '登録中...' : '登録してこの食品を選択'}
              </button>
            </form>
          </div>
        )}

        {/* Quantity & preview */}
        {selected && !showCustomForm && (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
            <p className="font-semibold text-slate-700 text-sm">{selected.name}</p>
            <div>
              <label className="text-xs text-slate-400 mb-2 block">量 (g)</label>
              <input type="number" value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>

            {preview && (
              <div className="bg-gradient-to-r from-slate-50 to-emerald-50/50 rounded-xl p-3 grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-xs text-slate-400">カロリー</p>
                  <p className="font-black text-emerald-600">{preview.calories}</p>
                  <p className="text-xs text-slate-400">kcal</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">P</p>
                  <p className="font-black text-blue-500">{preview.protein}</p>
                  <p className="text-xs text-slate-400">g</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">F</p>
                  <p className="font-black text-amber-500">{preview.fat}</p>
                  <p className="text-xs text-slate-400">g</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">C</p>
                  <p className="font-black text-orange-500">{preview.carbs}</p>
                  <p className="text-xs text-slate-400">g</p>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-slate-400 mb-2 block">コスト（円）※任意</label>
              <input type="number" value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>

            <button onClick={addToCart}
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <PlusCircle size={18} />
              リストに追加
            </button>
          </div>
        )}

        {/* Save all */}
        {cart.length > 0 && (
          <button onClick={handleSaveAll} disabled={saving}
            className={`w-full bg-gradient-to-r ${MEAL_COLORS[mealType]} text-white font-bold py-4 rounded-2xl shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-base`}>
            {saving ? '保存中...' : `${cart.length}品をまとめて記録する (${cartTotalCalories} kcal)`}
          </button>
        )}
      </div>

      <Navigation />
    </div>
  )
}
