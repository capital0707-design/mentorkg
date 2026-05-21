'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { auth, User } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// ✅ ИСПРАВЛЕНИЕ: Полный интерфейс Booking со всеми полями
interface Booking {
  id: number
  studentName: string
  studentPhone: string
  tutorName: string
  subject: string
  level: string
  date: string
  time: string
  status: string
  jitsiRoom: string
}

export default function TutorDashboard() {
  const router = useRouter()
  const [urlParams, setUrlParams] = useState<{ onboarding?: string; pending?: string }>({})

useEffect(() => {
  // Читаем параметры только на клиенте, после монтирования
  const params = new URLSearchParams(window.location.search)
  setUrlParams({
    onboarding: params.get('onboarding') || undefined,
    pending: params.get('pending') || undefined
  })
}, [])
  const [user, setUser] = useState<User | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const currentUser = auth.getCurrentUser()
    if (!currentUser) {
      router.push('/auth')
      return
    }
    if (currentUser.role !== 'tutor') {
      router.push('/dashboard/student')
      return
    }
    setUser(currentUser)
    
    if (!currentUser.tutorData?.isApproved) {
      setShowOnboarding(true)
    }
    
    const allBookings = JSON.parse(localStorage.getItem('mk_bookings') || '[]')
    const myBookings = allBookings.filter((b: Booking) => b.tutorName === currentUser.name)
    setBookings(myBookings)
  }, [router])

  const updateBookingStatus = (id: number, newStatus: string) => {
    const all = JSON.parse(localStorage.getItem('mk_bookings') || '[]')
    const updated = all.map((b: Booking) => b.id === id ? { ...b, status: newStatus } : b)
    localStorage.setItem('mk_bookings', JSON.stringify(updated))
    setBookings(updated.filter((b: Booking) => b.tutorName === user?.name))
  }

  if (!user) return <div className="p-8 text-center">Загрузка...</div>

if (showOnboarding || urlParams.onboarding === '1') { ... }
if (urlParams.pending === '1' || !user.tutorData?.isApproved) { ... }
    return (
      <main className="min-h-screen bg-gray-100 max-w-md mx-auto shadow-2xl p-4">
        <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-200 mt-10">
          <div className="text-4xl mb-4">👨</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Заполните профиль репетитора</h2>
          <p className="text-gray-500 text-sm mb-6">Чтобы ученики могли вас найти, укажите предмет, опыт и условия занятий</p>
          <Link href="/register?role=tutor" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">
            Заполнить профиль
          </Link>
          <p className="text-xs text-gray-400 mt-4">После проверки администратором ваш профиль появится в поиске</p>
        </div>
      </main>
    )
  }

  if (searchParams.get('pending') === '1' || !user.tutorData?.isApproved) {
    return (
      <main className="min-h-screen bg-gray-100 max-w-md mx-auto shadow-2xl p-4">
        <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-200 mt-10">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Профиль на проверке</h2>
          <p className="text-gray-500 text-sm mb-6">Администратор проверит ваши данные. Обычно это занимает до 24 часов.</p>
          <button onClick={() => router.push('/')} className="text-indigo-600 text-sm font-medium hover:underline">
            Вернуться на главную
          </button>
        </div>
      </main>
    )
  }

  const stats = {
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  }

  return (
    <main className="min-h-screen bg-gray-100 max-w-md mx-auto shadow-2xl pb-24">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <h1 className="font-semibold">👨 Кабинет репетитора</h1>
        <button onClick={() => { auth.logout(); router.push('/') }} className="text-sm text-red-500">Выйти</button>
      </header>

      <div className="p-4 space-y-4">
        {/* Профиль */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex items-center gap-3">
          <img src={user.tutorData?.photo_url || 'https://i.pravatar.cc/150?u=tutor'} alt="" className="w-14 h-14 rounded-full object-cover" />
          <div>
            <h2 className="font-bold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.tutorData?.subject} • {user.tutorData?.level}</p>
            <p className="text-sm font-medium text-indigo-600">{user.tutorData?.price} сом/ч</p>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-yellow-700">Ожидает</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
            <p className="text-xs text-blue-700">Подтверждено</p>
          </div>
          <div className="bg-green-50 p-3 rounded-xl border border-green-100 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-green-700">Проведено</p>
          </div>
        </div>

        {/* Заявки */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-3">Заявки на уроки</h3>
          {bookings.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Пока нет заявок</p>
          ) : (
            <div className="space-y-3">
              {bookings.map(b => (
                <div key={b.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{b.studentName}</p>
                      <p className="text-sm text-gray-500">{b.subject} • {b.date} в {b.time}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                      b.status === 'completed' ? 'bg-green-100 text-green-700' :
                      b.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {b.status === 'pending' ? 'Ожидает' : b.status === 'confirmed' ? 'Подтверждён' : 'Проведён'}
                    </span>
                  </div>
                  
                  {b.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => updateBookingStatus(b.id, 'confirmed')} className="flex-1 bg-blue-50 text-blue-700 py-1.5 rounded-lg text-xs font-medium">✅ Подтвердить</button>
                      <button onClick={() => updateBookingStatus(b.id, 'cancelled')} className="flex-1 bg-red-50 text-red-700 py-1.5 rounded-lg text-xs font-medium">❌ Отклонить</button>
                    </div>
                  )}
                  
                  {b.status === 'confirmed' && (
                    <div className="flex gap-2">
                      <a href={`https://meet.jit.si/${b.jitsiRoom}`} target="_blank" className="flex-1 bg-green-50 text-green-700 py-1.5 rounded-lg text-xs font-medium text-center">📹 Начать урок</a>
                      <button onClick={() => updateBookingStatus(b.id, 'completed')} className="flex-1 bg-gray-100 text-gray-700 py-1.5 rounded-lg text-xs font-medium">🏁 Завершить</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Навигация */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 max-w-md mx-auto">
        <div className="flex justify-around items-center">
          <Link href="/" className="flex flex-col items-center gap-0.5 py-1 px-3 text-gray-400 hover:text-gray-600">
            <span className="text-xl">🔍</span><span className="text-[10px]">Поиск</span>
          </Link>
          <button className="flex flex-col items-center gap-0.5 py-1 px-3 text-indigo-600">
            <span className="text-xl">👨🏫</span><span className="text-[10px] font-semibold">Кабинет</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 py-1 px-3 text-gray-400 hover:text-gray-600">
            <span className="text-xl">📊</span><span className="text-[10px]">Статистика</span>
          </button>
        </div>
      </nav>
    </main>
  )
}