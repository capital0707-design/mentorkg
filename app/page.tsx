'use client'
import { useState, useMemo, useEffect } from 'react'
import { categories, tutors } from '@/lib/mock-data'
import Link from 'next/link'

export default function Home() {
  const [category, setCategory] = useState('school')
  const [subject, setSubject] = useState('Математика')
  const [maxPrice, setMaxPrice] = useState(400)
  const [format, setFormat] = useState('online')

  // Безопасное получение предметов категории
  const currentCategory = categories?.find(c => c.id === category)
  const currentSubjects = currentCategory?.subjects || []

  // Авто-смена предмета при смене категории
  useEffect(() => {
    if (currentSubjects.length > 0 && !currentSubjects.includes(subject)) {
      setSubject(currentSubjects[0])
    }
  }, [category, currentSubjects])

  // Безопасная фильтрация
  const filteredTutors = useMemo(() => {
    if (!tutors || !Array.isArray(tutors)) return []
    
    return tutors
      .filter(t => {
        if (!t) return false
        return (
          t.category === category && 
          t.subject === subject && 
          t.price <= maxPrice && 
          t.formats?.includes(format)
        )
      })
      .sort((a, b) => (b?.rating || 0) - (a?.rating || 0))
  }, [category, subject, maxPrice, format])

  // Единый стиль для полей: чёткие контуры
  const inputClass = "w-full p-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"

  return (
    <main className="min-h-screen bg-gray-100 max-w-md mx-auto shadow-2xl pb-24">
      {/* Шапка */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">📍</span>
          <span className="text-sm font-semibold text-gray-700">Бишкек</span>
        </div>
 <Link href="/auth" className="text-sm font-medium text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition">
  Войти / Регистрация
</Link>
      </header>

      <div className="p-4 space-y-4">
        <div className="pt-2">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Найдите репетитора</h1>
          <p className="text-gray-500 text-sm mt-1">Под Ваши цели</p>
        </div>

        {/* Форма поиска */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 space-y-4">
          
          {/* Категория */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Категория</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className={inputClass}>
              {categories?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Предмет */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Предмет</label>
            <select value={subject} onChange={e => setSubject(e.target.value)} className={inputClass}>
              {currentSubjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Бюджет */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Бюджет за урок</label>
            <select value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} className={inputClass}>
              <option value={400}>До 400 сом</option>
              <option value={600}>До 600 сом</option>
              <option value={800}>До 800 сом</option>
              <option value={1000}>До 1000 сом</option>             
            </select>
          </div>

          {/* Формат */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Формат занятий</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'online', icon: '💻', label: 'Онлайн' },
                { id: 'offline', icon: '🏠', label: 'Офлайн' },
                { id: 'micro', icon: '👥', label: 'Группа' }
              ].map(f => (
                <button 
                  key={f.id} 
                  onClick={() => setFormat(f.id)} 
                  className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all duration-200 flex flex-col items-center gap-1 border ${
                    format === f.id 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 scale-105' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
                  }`}
                >
                  <span className="text-lg">{f.icon}</span>
                  <span>{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center pt-1">
            <span className="inline-block text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
              Найдено: <span className="font-bold text-gray-900">{filteredTutors.length}</span> репетиторов
            </span>
          </div>
        </div>

        {/* Список */}
        <div className="space-y-3 pb-24">
          {filteredTutors.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 border-dashed">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-900 font-semibold mb-1">Ничего не найдено</p>
              <p className="text-sm text-gray-500">Попробуйте увеличить бюджет или сменить формат</p>
            </div>
          ) : (
            filteredTutors.map(t => (
              <div key={t.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-300 hover:shadow-md transition-shadow">
                <div className="flex gap-3">
                  <img src={t.photo_url} alt={t.name} className="w-14 h-14 rounded-full object-cover bg-gray-200 flex-shrink-0 ring-2 ring-gray-100" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900 text-base">{t.name}</h3>
                      <div className="flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded-lg">
                        <span className="text-amber-500 text-sm">⭐</span>
                        <span className="text-xs font-bold text-amber-700">{t.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5 font-medium">{t.subject} • {t.level}</p>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                        t.formats.includes('online') ? 'bg-blue-50 text-blue-700' : 
                        t.formats.includes('offline') ? 'bg-green-50 text-green-700' : 'bg-purple-50 text-purple-700'
                      }`}>
                        {t.formats.includes('online') ? '💻 Онлайн' : t.formats.includes('offline') ? '🏠 Офлайн' : '👥 Группа'}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-0.5">📍 {t.district}</span>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                      <div>
                        <span className="text-lg font-bold text-indigo-600">{t.price}</span>
                        <span className="text-sm text-gray-500 font-medium"> сом/ч</span>
                      </div>
                      <Link href={`/tutor/${t.id}?subject=${t.subject}`} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 text-center">
                        📅 Записаться
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Нижняя навигация */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 max-w-md mx-auto">
        <div className="flex justify-around items-center">
          <button className="flex flex-col items-center gap-0.5 py-1 px-3 text-indigo-600">
            <span className="text-xl">🔍</span>
            <span className="text-[10px] font-semibold">Поиск</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 py-1 px-3 text-gray-400 hover:text-gray-600">
            <span className="text-xl">❤️</span>
            <span className="text-[10px] font-medium">Избранное</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 py-1 px-3 text-gray-400 hover:text-gray-600">
            <span className="text-xl">💬</span>
            <span className="text-[10px] font-medium">Чаты</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 py-1 px-3 text-gray-400 hover:text-gray-600">
            <span className="text-xl">👤</span>
            <span className="text-[10px] font-medium">Профиль</span>
          </button>
        </div>
      </nav>
    </main>
  )
}