// かわいい食べ物SVGイラスト集
import { CSSProperties } from 'react'

interface IllustProps { className?: string; style?: CSSProperties }

export function IllustBowl({ className = '', style }: IllustProps) {
  return (
    <svg viewBox="0 0 120 100" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 湯気 */}
      <path d="M45 28 Q43 22 45 16 Q47 10 45 4" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M60 26 Q58 20 60 14 Q62 8 60 2" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M75 28 Q73 22 75 16 Q77 10 75 4" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5"/>
      {/* ボウル本体 */}
      <ellipse cx="60" cy="55" rx="44" ry="12" fill="#e2e8f0"/>
      <path d="M16 55 Q18 82 60 85 Q102 82 104 55 Z" fill="#f8fafc"/>
      <path d="M16 55 Q18 82 60 85 Q102 82 104 55 Z" fill="url(#bowlGrad)" opacity="0.3"/>
      {/* 麺 */}
      <path d="M28 52 Q40 46 52 52 Q64 58 76 52 Q88 46 96 52" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M25 57 Q37 51 49 57 Q61 63 73 57 Q85 51 98 57" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* トッピング */}
      <circle cx="45" cy="50" r="5" fill="#f87171"/>
      <circle cx="60" cy="47" r="4" fill="#86efac"/>
      <circle cx="74" cy="50" r="5" fill="#fca5a5"/>
      {/* ボウルのフチ */}
      <ellipse cx="60" cy="55" rx="44" ry="12" stroke="#cbd5e1" strokeWidth="2" fill="none"/>
      <defs>
        <linearGradient id="bowlGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981"/>
          <stop offset="100%" stopColor="#6366f1"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

export function IllustPlate({ className = '', style }: IllustProps) {
  return (
    <svg viewBox="0 0 100 80" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 皿 */}
      <ellipse cx="50" cy="55" rx="42" ry="14" fill="#e2e8f0"/>
      <ellipse cx="50" cy="52" rx="38" ry="22" fill="#f8fafc"/>
      <ellipse cx="50" cy="52" rx="38" ry="22" stroke="#e2e8f0" strokeWidth="2" fill="none"/>
      {/* ご飯山盛り */}
      <ellipse cx="50" cy="44" rx="22" ry="14" fill="#fef9c3"/>
      <path d="M28 44 Q35 30 50 28 Q65 30 72 44" fill="#fef3c7"/>
      <ellipse cx="50" cy="44" rx="22" ry="6" fill="#fef9c3"/>
      {/* ふりかけ的な点 */}
      <circle cx="43" cy="38" r="2" fill="#f87171" opacity="0.7"/>
      <circle cx="55" cy="35" r="1.5" fill="#86efac" opacity="0.7"/>
      <circle cx="50" cy="40" r="1.5" fill="#fbbf24" opacity="0.7"/>
      <circle cx="60" cy="38" r="2" fill="#f87171" opacity="0.7"/>
      {/* 箸 */}
      <line x1="78" y1="15" x2="88" y2="60" stroke="#a16207" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="84" y1="15" x2="92" y2="57" stroke="#a16207" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

export function IllustSalad({ className = '', style }: IllustProps) {
  return (
    <svg viewBox="0 0 90 90" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* ボウル */}
      <path d="M10 50 Q12 78 45 80 Q78 78 80 50 Z" fill="#dbeafe"/>
      <ellipse cx="45" cy="50" rx="35" ry="10" fill="#eff6ff"/>
      <ellipse cx="45" cy="50" rx="35" ry="10" stroke="#bfdbfe" strokeWidth="2" fill="none"/>
      {/* 葉物 */}
      <ellipse cx="32" cy="42" rx="12" ry="8" fill="#86efac" transform="rotate(-20 32 42)"/>
      <ellipse cx="45" cy="38" rx="14" ry="9" fill="#4ade80" transform="rotate(5 45 38)"/>
      <ellipse cx="58" cy="42" rx="12" ry="8" fill="#86efac" transform="rotate(15 58 42)"/>
      {/* トマト */}
      <circle cx="36" cy="46" r="6" fill="#f87171"/>
      <path d="M33 42 Q36 38 39 42" fill="#4ade80"/>
      {/* きゅうり */}
      <ellipse cx="55" cy="47" rx="7" ry="4" fill="#6ee7b7" transform="rotate(-10 55 47)"/>
      <ellipse cx="55" cy="47" rx="5" ry="2.5" fill="#a7f3d0" transform="rotate(-10 55 47)"/>
      {/* コーン */}
      <circle cx="46" cy="48" r="3" fill="#fbbf24"/>
      <circle cx="41" cy="50" r="2.5" fill="#fbbf24"/>
    </svg>
  )
}

export function IllustDumbbell({ className = '', style }: IllustProps) {
  return (
    <svg viewBox="0 0 100 60" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* バー */}
      <rect x="30" y="26" width="40" height="8" rx="4" fill="#c7d2fe"/>
      {/* 左ウェイト */}
      <rect x="10" y="18" width="22" height="24" rx="6" fill="#818cf8"/>
      <rect x="14" y="22" width="14" height="16" rx="4" fill="#6366f1"/>
      {/* 右ウェイト */}
      <rect x="68" y="18" width="22" height="24" rx="6" fill="#818cf8"/>
      <rect x="72" y="22" width="14" height="16" rx="4" fill="#6366f1"/>
      {/* ハイライト */}
      <rect x="16" y="24" width="4" height="12" rx="2" fill="#a5b4fc" opacity="0.6"/>
      <rect x="74" y="24" width="4" height="12" rx="2" fill="#a5b4fc" opacity="0.6"/>
    </svg>
  )
}

export function IllustHeart({ className = '', style }: IllustProps) {
  return (
    <svg viewBox="0 0 60 55" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 48 C30 48 5 32 5 18 C5 10 11 4 18 4 C23 4 27 7 30 11 C33 7 37 4 42 4 C49 4 55 10 55 18 C55 32 30 48 30 48Z"
        fill="#f472b6"/>
      <path d="M30 44 C30 44 10 30 10 18 C10 13 14 8 18 8 C22 8 26 11 30 15 C34 11 38 8 42 8 C46 8 50 13 50 18 C50 30 30 44 30 44Z"
        fill="#fb7185"/>
      <path d="M18 12 Q22 10 25 14" stroke="#fecdd3" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
    </svg>
  )
}

export function IllustApple({ className = '', style }: IllustProps) {
  return (
    <svg viewBox="0 0 70 80" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 葉 */}
      <path d="M38 14 Q48 6 52 14 Q48 22 38 18 Z" fill="#4ade80"/>
      {/* 茎 */}
      <path d="M36 18 Q35 10 38 6" stroke="#a16207" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* りんご本体 */}
      <path d="M12 36 Q10 20 25 16 Q32 14 36 18 Q40 14 48 16 Q62 20 60 36 Q62 58 36 64 Q10 58 12 36Z" fill="#f87171"/>
      <path d="M12 36 Q10 20 25 16 Q32 14 36 18 Q40 14 48 16 Q62 20 60 36 Q62 58 36 64 Q10 58 12 36Z" stroke="#fca5a5" strokeWidth="1" fill="none"/>
      {/* ハイライト */}
      <ellipse cx="26" cy="28" rx="6" ry="9" fill="#fecaca" opacity="0.5" transform="rotate(-20 26 28)"/>
    </svg>
  )
}
