'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/Navigation'
import { PlusCircle, X } from 'lucide-react'

interface ExpenseRecord {
  id: string
  date: string
  store_name: string
  amount: number
  memo: string | null
}

interface MonthlyBudget {
  budget: number
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([])
  const [mealCostTotal, setMealCostTotal] = useState(0)
  const [budget, setBudget] = useState<number | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const [form, setForm] = useState({
    date: now.toISOString().split('T')[0],
    store_name: '',
    amount: '',
    memo: '',
  })
  const [budgetInput, setBudgetInput] = useState('')
  const [editingBudget, setEditingBudget] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: profile } = await supabase.from('profiles').select('id').limit(1).single()
      if (!profile) return
      setUserId(profile.id)

      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]

      const [{ data: expData }, { data: budgetData }, { data: mealData }] = await Promise.all([
        supabase
          .from('expense_records')
          .select('*')
          .eq('user_id', profile.id)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: false }),
        supabase
          .from('monthly_budgets')
          .select('budget')
          .eq('user_id', profile.id)
          .eq('year', year)
          .eq('month', month)
          .single(),
        supabase
          .from('meal_records')
          .select('cost')
          .eq('user_id', profile.id)
          .gte('date', startDate)
          .lte('date', endDate)
          .not('cost', 'is', null),
      ])

      setExpenses(expData || [])
      const mealTotal = (mealData || []).reduce((s: number, r: { cost: number }) => s + (r.cost || 0), 0)
      setMealCostTotal(Math.round(mealTotal))
      if (budgetData) {
        setBudget((budgetData as MonthlyBudget).budget)
        setBudgetInput(String((budgetData as MonthlyBudget).budget))
      }
      setLoading(false)
    }
    load()
  }, [year, month])

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return

    const { data, error } = await supabase
      .from('expense_records')
      .insert({
        user_id: userId,
        date: form.date,
        store_name: form.store_name,
        amount: Number(form.amount),
        memo: form.memo || null,
      })
      .select()
      .single()

    if (!error && data) {
      setExpenses((prev) => [data, ...prev])
      setForm({ date: now.toISOString().split('T')[0], store_name: '', amount: '', memo: '' })
      setShowForm(false)
    }
  }

  async function handleDeleteExpense(id: string) {
    await supabase.from('expense_records').delete().eq('id', id)
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  async function handleSaveBudget() {
    if (!userId || !budgetInput) return
    const budgetNum = Number(budgetInput)

    await supabase
      .from('monthly_budgets')
      .upsert({ user_id: userId, year, month, budget: budgetNum })

    setBudget(budgetNum)
    setEditingBudget(false)
  }

  const shoppingTotal = expenses.reduce((s, e) => s + e.amount, 0)
  const totalSpent = shoppingTotal + mealCostTotal
  const remaining = budget !== null ? budget - totalSpent : null
  const progress = budget ? Math.min((totalSpent / budget) * 100, 100) : 0

  const monthLabel = `${year}年${month}月`

  return (
    <div className="max-w-lg mx-auto pb-20 min-h-screen bg-gradient-to-br from-slate-50 to-pink-50/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-5 pt-10 pb-6 text-white">
        <h1 className="text-xl font-bold">食費管理</h1>
        <p className="text-pink-100 text-sm">{monthLabel}</p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-300">読み込み中...</div>
      ) : (
        <div className="px-4 pt-5 space-y-4">
          {/* Budget summary */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-400">今月の合計支出</p>
                <p className="text-3xl font-bold text-slate-800">¥{totalSpent.toLocaleString()}</p>
                <div className="flex gap-3 mt-1">
                  <span className="text-xs text-slate-400">買い物 ¥{shoppingTotal.toLocaleString()}</span>
                  {mealCostTotal > 0 && (
                    <span className="text-xs text-pink-500">食事コスト ¥{mealCostTotal.toLocaleString()}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                {editingBudget ? (
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      className="w-24 border border-slate-200 rounded-lg px-2 py-1 text-sm text-right"
                      placeholder="50000"
                    />
                    <button
                      onClick={handleSaveBudget}
                      className="text-xs bg-emerald-500 text-white px-2 py-1 rounded-lg"
                    >
                      保存
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingBudget(true)}
                    className="text-right"
                  >
                    <p className="text-xs text-slate-400">予算</p>
                    <p className="text-lg font-semibold text-slate-600">
                      {budget !== null ? `¥${budget.toLocaleString()}` : '未設定'}
                    </p>
                  </button>
                )}
              </div>
            </div>

            {budget !== null && (
              <>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      totalSpent > budget ? 'bg-red-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className={`text-sm font-medium ${remaining !== null && remaining < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                  {remaining !== null && remaining >= 0
                    ? `残り ¥${remaining.toLocaleString()}`
                    : `¥${Math.abs(remaining!).toLocaleString()} オーバー`}
                </p>
              </>
            )}
          </div>

          {/* Add expense form */}
          {showForm && (
            <form onSubmit={handleAddExpense} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
              <h2 className="font-semibold text-slate-700">支出を追加</h2>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">日付</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">購入場所</label>
                <input
                  type="text"
                  required
                  value={form.store_name}
                  onChange={(e) => setForm(f => ({ ...f, store_name: e.target.value }))}
                  placeholder="例：スーパー、コンビニ"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">金額（円）</label>
                <input
                  type="number"
                  required
                  value={form.amount}
                  onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="1500"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">メモ（任意）</label>
                <input
                  type="text"
                  value={form.memo}
                  onChange={(e) => setForm(f => ({ ...f, memo: e.target.value }))}
                  placeholder="例：週末の食材まとめ買い"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-500"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium"
                >
                  追加
                </button>
              </div>
            </form>
          )}

          {/* Expense list */}
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-slate-300">今月の記録はありません</div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-50">
                {expenses.map((e) => (
                  <div key={e.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{e.store_name}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(e.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                        {e.memo && ` · ${e.memo}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-slate-700">¥{e.amount.toLocaleString()}</p>
                      <button
                        onClick={() => handleDeleteExpense(e.id)}
                        className="text-slate-300 hover:text-red-400"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-emerald-300 hover:text-emerald-500 transition-colors"
            >
              <PlusCircle size={18} />
              <span className="text-sm">支出を追加</span>
            </button>
          )}
        </div>
      )}

      <Navigation />
    </div>
  )
}
