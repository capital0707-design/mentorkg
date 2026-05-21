'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { auth, UserRole } from '@/lib/auth'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [role, setRole] = useState<UserRole>('student')
  const [formData, setFormData] = useState({
    name: '', phone: '', password: '', confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    const clean = digits.startsWith('996') ? digits.slice(3) : digits
    const limited = clean.slice(0, 9)
    const p1 = limited.slice(0,3), p2 = limited.slice(3,6), p3 = limited.slice(6,9)
    let r = '+996'
    if (p1) r += ` ${p1}`; if (p2) r += ` ${p2}`; if (p3) r += ` ${p3}`
    return r
  }
  const unformatPhone = (v: string) => v.replace(/\D/g, '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Пароли не совпадают')
        }
        if (unformatPhone(formData.phone).length < 9) {
          throw new Error('Введите корректный номер телефона')
        }
        
        const user = auth.register({
          name: formData.name,
          phone: unformatPhone(formData.phone),
          password: formData.password,
          role
        })
        localStorage.setItem('mk_current_user', JSON.stringify(user))
        
        // Редирект по роли
        if (role === 'tutor') {
          router.push('/dashboard/tutor?onboarding=1')
        } else {
          router.push('/dashboard/student')
        }
      } else {
        const user = auth.login(unformatPhone(formData.phone), formData.password)
        if (user.role === 'tutor' && !user.tutorData?.isApproved) {
          router.push('/dashboard/tutor?pending=1')
        } else if (user.role === 'tutor') {
          router.push('/dashboard/tutor')
        } else {
          router.push('/dashboard/student')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full p-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"

  return (
    <main className="min-h-screen bg-gray-100 max-w-md mx-auto shadow-2xl flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full shadow-lg border border-gray-200">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">MentorKG</h1>
          <p className="text-gray-500 text-sm">Вход или регистрация</p>
        </div>

        {/* Переключатель режима */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button 
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${mode === 'login' ? 'bg-white text-indigo-600 shadow' : 'text-gray-500'}`}
          >
            Вход
          </button>
          <button 
            onClick={() => setMode('register')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${mode === 'register' ? 'bg-white text-indigo-600 shadow' : 'text-gray-500'}`}
          >
            Регистрация
          </button>
        </div>

        {/* Выбор роли (только при регистрации) */}
        {mode === 'register' && (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Я хочу:</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button"
                onClick={() => setRole('student')}
                className={`p-3 rounded-xl border text-sm font-medium transition flex flex-col items-center gap-1 ${
                  role === 'student' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 hover:border-indigo-300'
                }`}
              >
                <span className="text-2xl">🎓</span>
                <span>Учиться</span>
              </button>
              <button 
                type="button"
                onClick={() => setRole('tutor')}
                className={`p-3 rounded-xl border text-sm font-medium transition flex flex-col items-center gap-1 ${
                  role === 'tutor' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 hover:border-indigo-300'
                }`}
              >
                <span className="text-2xl">👨🏫</span>
                <span>Преподавать</span>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ф.И.О. *</label>
              <input required type="text" placeholder="Фамилия, Имя, Отчество" 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className={inputClass} />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Телефон *</label>
            <input required type="tel" placeholder="+996 ___ ___ ___" 
              value={formatPhone(formData.phone)} 
              onChange={e => setFormData({...formData, phone: e.target.value})}
              inputMode="numeric" className={inputClass} />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Пароль *</label>
            <input required type="password" placeholder="••••••••" 
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
              className={inputClass} />
          </div>
          
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Подтвердите пароль *</label>
              <input required type="password" placeholder="••••••••" 
                value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                className={inputClass} />
            </div>
          )}

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition">
            {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          {mode === 'login' ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }} 
            className="text-indigo-600 font-medium hover:underline">
            {mode === 'login' ? 'Создать' : 'Войти'}
          </button>
        </p>

        <Link href="/" className="block text-center text-xs text-gray-400 mt-4 hover:text-gray-600">
          ← Вернуться на главную
        </Link>
      </div>
    </main>
  )
}