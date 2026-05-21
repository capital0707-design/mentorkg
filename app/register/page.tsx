'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { categories } from '@/lib/mock-data'
import { auth } from '@/lib/auth'
import Link from 'next/link'

// ... (функции formatPhone и unformatPhone оставляем без изменений) ...
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

export default function RegisterTutor() {
  const router = useRouter()
  const [isAuthChecked, setIsAuthChecked] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // ✅ 1. ПРОВЕРКА АВТОРИЗАЦИИ ПРИ ЗАГРУЗКЕ
  useEffect(() => {
    const user = auth.getCurrentUser()
    if (!user) {
      router.replace('/auth') // Нет аккаунта → на вход
    } else if (user.role !== 'tutor') {
      router.replace('/dashboard/student') // Ученик → в свой кабинет
    } else {
      setCurrentUser(user)
      setIsAuthChecked(true) // Доступ разрешён
    }
  }, [router])

  const [category, setCategory] = useState('school')
  const [subject, setSubject] = useState('Математика')
  const [formData, setFormData] = useState({
    phone: '', level: '', price: 700,
    formats: ['online'] as string[], district: '',
    bio: '', education: '', photo: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [phoneError, setPhoneError] = useState('')

  const currentSubjects = categories.find(c => c.id === category)?.subjects || []

  useEffect(() => {
    if (!currentSubjects.includes(subject)) setSubject(currentSubjects[0] || '')
  }, [category])

  // ... (остальные обработчики handleToggleFormat, handleNameChange, handlePhoneChange, handlePhotoUpload оставляем как были) ...
  const handleToggleFormat = (format: string) => {
    setFormData(prev => ({
      ...prev,
      formats: prev.formats.includes(format) ? prev.formats.filter(f => f !== format) : [...prev.formats, format]
    }))
  }
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setFormData({ ...formData, phone: formatted })
    const digits = unformatPhone(formatted)
    setPhoneError(digits.length < 9 && digits.length > 0 ? `Введите ещё ${9 - digits.length} цифр` : '')
  }
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setFormData(prev => ({ ...prev, photo: reader.result as string }))
      reader.readAsDataURL(file)
    }
  }

  // ✅ 2. ОТПРАВКА: ПРИВЯЗКА ДАННЫХ К ТЕКУЩЕМУ ПОЛЬЗОВАТЕЛЮ
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (unformatPhone(formData.phone).length < 9) {
      setPhoneError('Введите корректный номер')
      return
    }
    if (!currentUser) return

    // Собираем данные профиля
    const tutorProfile = {
      category,
      subject,
      ...formData,
      phone_raw: unformatPhone(formData.phone),
      photo_url: formData.photo || `https://i.pravatar.cc/150?u=${currentUser.name.replace(/\s/g, '')}`,
      isApproved: false, // Админ должен одобрить
      rating: 0,
      reviews_count: 0,
      reviews: []
    }

    // ✅ Обновляем текущего юзера через auth-утилиту
    auth.updateUser(currentUser.id, { tutorData: tutorProfile })
    
    setIsSubmitted(true)
    setTimeout(() => router.push('/dashboard/tutor?pending=1'), 1500)
  }

  if (!isAuthChecked) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Проверка доступа...</div>
  }

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-gray-100 max-w-md mx-auto flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-200">
          <div className="text-5xl mb-4">📤</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Профиль отправлен на проверку</h2>
          <p className="text-gray-500 text-sm">Администратор активирует ваш аккаунт в течение 24 часов.</p>
        </div>
      </main>
    )
  }

  const inputClass = "w-full p-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2"

  return (
    <main className="min-h-screen bg-gray-100 max-w-md mx-auto pb-24">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Link href="/dashboard/tutor" className="p-2 -ml-2 rounded-full hover:bg-gray-100">←</Link>
        <h1 className="font-semibold text-gray-900">Заполните профиль</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* ... (весь блок с фото, Ф.И.О. уже заполнен в currentUser.name, категории, условия, о себе оставляем как были) ... */}
        {/* Для экономии места показываю только ключевые изменения в верстке */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 space-y-4">
          <h2 className="font-bold text-gray-900 text-lg"> Личные данные</h2>
          <div className="flex flex-col items-center mb-2">
            <label className="relative cursor-pointer group">
              <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {formData.photo ? <img src={formData.photo} className="w-full h-full object-cover" /> : <span className="text-3xl">📷</span>}
              </div>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              <span className="absolute -bottom-6 text-xs text-gray-500">Загрузить фото</span>
            </label>
          </div>
          <div className="pt-8">
            <label className={labelClass}>Ф.И.О.</label>
            <input type="text" value={currentUser?.name || ''} readOnly className={`${inputClass} bg-gray-50`} />
            <p className="text-xs text-gray-400 mt-1">Указано при регистрации</p>
          </div>
          <div>
            <label className={labelClass}>Телефон</label>
            <input type="tel" placeholder="+996 ___ ___ ___" value={formData.phone} onChange={handlePhoneChange} inputMode="numeric" className={`${inputClass} ${phoneError ? 'border-red-400' : ''}`} />
            {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
          </div>
        </div>

        {/* Категории, Предмет, Уровень, Формат, Район, Цена, Образование, Опыт - оставляем без изменений из прошлого кода */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 space-y-4">
          <h2 className="font-bold text-gray-900 text-lg"> Что преподаёте</h2>
          <div><label className={labelClass}>Категория *</label><select value={category} onChange={e => setCategory(e.target.value)} className={inputClass}>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className={labelClass}>Предмет *</label><select value={subject} onChange={e => setSubject(e.target.value)} className={inputClass}>{currentSubjects.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          <div><label className={labelClass}>Уровень *</label><select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className={inputClass}><option value="">Выберите</option><option value="Дошкольники">🧸 Дошкольники</option><option value="1-4 класс">📓 1-4 класс</option><option value="5-9 класс"> 5-9 класс</option><option value="10-11 класс">📗 10-11 класс</option><option value="Взрослые">💼 Взрослые</option></select></div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 space-y-4">
          <h2 className="font-bold text-gray-900 text-lg">⚙️ Условия</h2>
          <div>
  <label className={labelClass}>Формат *</label>
  <div className="grid grid-cols-3 gap-2">
    {['online', 'offline', 'micro'].map(f => {
      // Выносим логику иконок и текста в переменные, чтобы не ломать JSX
      const icon = f === 'online' ? '' : f === 'offline' ? '' : '👥';
      const label = f === 'online' ? 'Онлайн' : f === 'offline' ? 'Офлайн' : 'Группа';
      
      return (
        <button
          key={f}
          type="button"
          onClick={() => handleToggleFormat(f)}
          className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all border ${
            formData.formats.includes(f)
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
              : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
          }`}
        >
          <span className="text-lg block">{icon}</span>
          <span>{label}</span>
        </button>
      );
    })}
  </div>
</div>
          <div><label className={labelClass}>Район</label><select value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className={inputClass}><option value="">Онлайн / Любой</option><option value="Октябрьский">Октябрьский</option><option value="Свердловский">Свердловский</option><option value="Первомайский">Первомайский</option><option value="Ленинский">Ленинский</option><option value="Другие">Другие</option></select></div>
          <div><label className={labelClass}>Цена (сом)</label><select value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className={inputClass}><option value={400}>400</option><option value={600}>600</option><option value={800}>800</option><option value={1000}>1000</option><option value={1500}>1500</option></select></div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 space-y-4">
          <h2 className="font-bold text-gray-900 text-lg">📝 О себе</h2>
          <div><label className={labelClass}>Образование</label><input type="text" placeholder="КГУ, 2020" value={formData.education} onChange={e => setFormData({...formData, education: e.target.value})} className={inputClass} /></div>
          <div><label className={labelClass}>Опыт *</label><textarea required rows={3} placeholder="Готовлю к ОРТ..." value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className={`${inputClass} resize-none`} /></div>
        </div>

        <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition">Отправить на проверку</button>
      </form>
    </main>
  )
}