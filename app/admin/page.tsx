'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

interface Booking {
  id: number
  studentName: string
  studentPhone: string
  tutorId: number
  tutorName: string
  subject: string
  date: string
  time: string
  status: BookingStatus
  jitsiRoom: string
  createdAt: string
}

const ADMIN_PASSWORD = 'admin123'

export default function AdminPanel() {
  const [isAuth, setIsAuth] = useState(false)
  const [password, setPassword] = useState('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState<BookingStatus | 'all'>('all')

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === 'true') setIsAuth(true)
    if (isAuth) {
      const stored = localStorage.getItem('mk_bookings')
      setBookings(stored ? JSON.parse(stored) : [])
    }
  }, [isAuth])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuth(true)
      sessionStorage.setItem('admin_auth', 'true')
    } else alert('Неверный пароль')
  }

  const updateStatus = (id: number, newStatus: BookingStatus) => {
    const updated = bookings.map(b => b.id === id ? { ...b, status: newStatus } : b)
    setBookings(updated)
    localStorage.setItem('mk_bookings', JSON.stringify(updated))
  }

  const deleteBooking = (id: number) => {
    const updated = bookings.filter(b => b.id !== id)
    setBookings(updated)
    localStorage.setItem('mk_bookings', JSON.stringify(updated))
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)
  const stats = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  }

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full">
          <h1 className="text-xl font-bold mb-4">🔐 Вход в админ-панель</h1>
          <form onSubmit={handleLogin} className="space-y-3">
            <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border rounded-xl" />
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold">Войти</button>
          </form>
          <p className="text-xs text-gray-400 mt-3 text-center">Тестовый пароль: admin123</p>
        </div>
      </div>
    )
  }

  const statusBadge = (status: BookingStatus) => {
    const map = { pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700', no_show: 'bg-gray-100 text-gray-600' }
    const labels = { pending: 'Ожидает', confirmed: 'Подтверждён', completed: 'Проведён', cancelled: 'Отменён', no_show: 'Не явился' }
    return <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${map[status]}`}>{labels[status]}</span>
  }

  return (
    <main className="min-h-screen bg-gray-100 max-w-4xl mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold"> Админ-панель MentorKG</h1>
        <div className="flex gap-2">
          <Link href="/" className="px-4 py-2 bg-white border rounded-xl text-sm hover:bg-gray-50">🏠 На сайт</Link>
          <button onClick={() => { sessionStorage.removeItem('admin_auth'); setIsAuth(false) }} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm">Выйти</button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border"><p className="text-sm text-gray-500">Всего</p><p className="text-2xl font-bold">{stats.all}</p></div>
        <div className="bg-white p-4 rounded-xl shadow-sm border"><p className="text-sm text-gray-500">Ожидает</p><p className="text-2xl font-bold text-yellow-600">{stats.pending}</p></div>
        <div className="bg-white p-4 rounded-xl shadow-sm border"><p className="text-sm text-gray-500">Подтверждено</p><p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p></div>
        <div className="bg-white p-4 rounded-xl shadow-sm border"><p className="text-sm text-gray-500">Проведено</p><p className="text-2xl font-bold text-green-600">{stats.completed}</p></div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {(['all', 'pending', 'confirmed', 'completed', 'cancelled', 'no_show'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${filter === f ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border'}`}>
            {f === 'all' ? 'Все' : f === 'pending' ? 'Ожидает' : f === 'confirmed' ? 'Подтверждено' : f === 'completed' ? 'Проведено' : f === 'cancelled' ? 'Отменено' : 'Не явился'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed">📭 Нет заявок</div>
        ) : (
          filtered.map(b => (
            <div key={b.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-lg">{b.studentName}</p>
                  <p className="text-sm text-gray-500">{b.studentPhone} • {b.subject}</p>
                </div>
                {statusBadge(b.status)}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                <p>👨🏫 {b.tutorName}</p>
                <p>📅 {b.date} в {b.time}</p>
                <p className="col-span-2">🔗 <a href={`https://meet.jit.si/${b.jitsiRoom}`} target="_blank" className="text-indigo-600 underline">Ссылка Jitsi</a></p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {b.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(b.id, 'confirmed')} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">✅ Подтвердить</button>
                    <button onClick={() => updateStatus(b.id, 'cancelled')} className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm">❌ Отклонить</button>
                  </>
                )}
                {b.status === 'confirmed' && (
                  <button onClick={() => updateStatus(b.id, 'completed')} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm">🏁 Завершить</button>
                )}
                {b.status === 'confirmed' && (
                  <button onClick={() => updateStatus(b.id, 'no_show')} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">🚫 Не явился</button>
                )}
                <button onClick={() => deleteBooking(b.id)} className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-sm ml-auto"> Удалить</button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}