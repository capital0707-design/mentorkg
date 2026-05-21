'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [formData, setFormData] = useState({ name: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    const clean = digits.startsWith('996') ? digits.slice(3) : digits
    const limited = clean.slice(0, 9)
    const p1 = limited.slice(0, 3)
    const p2 = limited.slice(3, 6)
    const p3 = limited.slice(6, 9)
    let r = '+996'
    if (p1) r += ` ${p1}`
    if (p2) r += ` ${p2}`
    if (p3) r += ` ${p3}`
    return r
  }
  const unformatPhone = (v: string) => v.replace(/\D/g, '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const phoneClean = unformatPhone(formData.phone)
      if (phoneClean.length < 9) throw new Error('Введите 9 цифр номера телефона')
      if (formData.password.length < 4) throw new Error('Пароль должен быть не короче 4 символов')

      if (mode === 'register') {
        if (!formData.name.trim()) throw new Error('Укажите Ф.И.О.')
        const user = auth.register({ name: formData.name.trim(), phone: phoneClean, password: formData.password, role: 'tutor' })
        localStorage.setItem('mk_current_user', JSON.stringify(user))
        router.push('/register?onboarding=1')
      } else {
        const user = auth.login(phoneClean, formData.password)
        if (user.role !== 'tutor') throw new Error('Доступ разрешён только репетиторам')
        router.push('/dashboard/tutor')
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full p-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"

  return (
    <main className="min-h-screen bg-gray-100 max-w-md mx-auto shadow-2xl flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full shadow-lg border border-gray-200">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">👨🏫</div>
          <h1 className="text-2xl font-bold text-gray-900">Кабинет репетитора</h1>
          <p className="text-gray-500 text-sm mt-1">{mode === 'login' ? 'Вход в систему' : 'Создание аккаунта'}</p>
        </div>

        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button onClick={() => { setMode('login'); setError('') }} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${mode === 'login' ? 'bg-white text-indigo-600 shadow' : 'text-gray-500'}`}>Вход</button>
          <button onClick={() => { setMode('register'); setError('') }} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${mode === 'register' ? 'bg-white text-indigo-600 shadow' : 'text-gray-500'}`}>Регистрация</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ф.И.О. *</label>
              <input required type="text" placeholder="Иванов Иван Иванович" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Телефон *</label>
            <input required type="tel" placeholder="+996 ___ ___ ___" value={formatPhone(formData.phone)} onChange={e => setFormData({...formData, phone: e.target.value})} inputMode="numeric" className={inputClass} />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Пароль *</label>
            <input required type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={inputClass} />
          </div>

          {error && <p className="text-sm text-red-600 text-center bg-red-50 p-2.5 rounded-lg font-medium">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition shadow-lg shadow-indigo-200">
            {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        {/* Ссылка на главную */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <Link href="/" className="block text-center text-base text-gray-600 hover:text-indigo-600 font-medium py-2 transition">
            ← На главную
          </Link>
        </div>
      </div>
    </main>
  )
}