'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusCircle, History, ShoppingCart, Settings } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'ホーム', icon: Home, color: 'text-emerald-500' },
  { href: '/record', label: '記録', icon: PlusCircle, color: 'text-teal-500' },
  { href: '/history', label: '履歴', icon: History, color: 'text-violet-500' },
  { href: '/expenses', label: '食費', icon: ShoppingCart, color: 'text-pink-500' },
  { href: '/setup', label: '設定', icon: Settings, color: 'text-slate-500' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 z-50">
      <div className="max-w-lg mx-auto flex">
        {navItems.map(({ href, label, icon: Icon, color }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 text-xs transition-all ${
                active ? color : 'text-slate-300 hover:text-slate-400'
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${active ? 'bg-slate-50' : ''}`}>
                <Icon size={21} strokeWidth={active ? 2.5 : 1.8} />
              </div>
              <span className={active ? 'font-semibold' : ''}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
