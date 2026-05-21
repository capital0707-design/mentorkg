'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { auth, User } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// ✅ ИСПРАВЛЕНИЕ: Добавили studentName и другие поля, которые используются ниже
interface Booking {
  id: number
  studentName: string
  studentPhone: string
  tutorName: string
  subject: string
  date: string
  time: string
  status: string
  jitsiRoom: string
}

export default function StudentDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])

  useEffect(() => {
    const currentUser = auth.getCurrentUser()
    if (!currentUser) {
      router.push('/auth')
      return
    }
    setUser(currentUser)
    
    // Загружаем заявки
    const allBookings = JSON.parse(localStorage.getItem('mk_bookings') || '[]')
    // Фильтруем: показываем те, где имя совпадает с именем текущего юзера
    const myBookings = allBookings.filter((b: Booking) => b.studentName === currentUser.name)
    setBookings(myBookings)
  }, [router])

  if (!user) return <div className="p-8 text-center">Загрузка...</div>

  return (
    <main className="min-h-screen bg-gray-100 max-w-md mx-auto shadow-2xl pb-24">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <h1 className="font-semibold"> Мой кабинет</h1>
        <button onClick={() => { auth.logout(); router.push('/') }} className="text-sm text-red-500">Выйти</button>
      </header>

      <div className="p-4 space-y-4">
        {/* Приветствие */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Добро пожаловать,</p>
          <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-sm text-gray-500 mt-1"> {user.phone.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '+996 $1 $2 $3 $4')}</p>
        </div>

        {/* Быстрые действия */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/" className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center hover:bg-indigo-100 transition">
            <span className="text-2xl block mb-1">🔍</span>
            <span className="text-sm font-medium text-indigo-700">Найти репетитора</span>
          </Link>
          <button className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center hover:bg-gray-100 transition">
            <span className="text-2xl block mb-1">❤️</span>
            <span className="text-sm font-medium text-gray-700">Избранное</span>
          </button>
        </div>

        {/* История записей */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-3">Мои уроки</h3>
          {bookings.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Пока нет записей</p>
          ) : (
            <div className="space-y-3">
              {bookings.map(b => (
                <div key={b.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{b.tutorName}</p>
                      <p className="text-sm text-gray-500">{b.subject}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                      b.status === 'completed' ? 'bg-green-100 text-green-700' :
                      b.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {b.status === 'completed' ? 'Проведён' : b.status === 'confirmed' ? 'Подтверждён' : 'Ожидает'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">📅 {b.date} в {b.time}</p>
                  {b.status === 'confirmed' && (
                    <a href={`https://meet.jit.si/${b.jitsiRoom}`} target="_blank" 
                      className="inline-block mt-2 text-xs text-indigo-600 hover:underline">
                      🔗 Подключиться к уроку
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Нижняя навигация */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 max-w-md mx-auto">
        <div className="flex justify-around items-center">
          <Link href="/" className="flex flex-col items-center gap-0.5 py-1 px-3 text-gray-400 hover:text-gray-600">
            <span className="text-xl">🔍</span><span className="text-[10px]">Поиск</span>
          </Link>
          <button className="flex flex-col items-center gap-0.5 py-1 px-3 text-indigo-600">
            <span className="text-xl"></span><span className="text-[10px] font-semibold">Кабинет</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 py-1 px-3 text-gray-400 hover:text-gray-600">
            <span className="text-xl">💬</span><span className="text-[10px]">Чаты</span>
          </button>
        </div>
      </nav>
    </main>
  )
}