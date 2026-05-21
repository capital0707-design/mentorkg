'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { tutors } from '@/lib/mock-data'
import Link from 'next/link'

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
interface Booking {
  id: number
  studentName: string
  studentPhone: string
  tutorId: number
  tutorName: string
  subject: string
  level: string
  date: string
  time: string
  status: BookingStatus
  jitsiRoom: string
  createdAt: string
}

const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '18:00', '19:00']

export default function TutorProfile() {
  const router = useRouter()
  const { id } = useParams()
  const tutorId = parseInt(id as string || '1')
  const tutor = tutors.find(t => t.id === tutorId) || tutors[0]

  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'booking'>('about')
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBooked, setIsBooked] = useState(false)

  if (!tutor) return <div className="p-8 text-center">Репетитор не найден</div>

  const handleBook = () => {
    if (!selectedSlot) return

    const jitsiRoom = `MentorKG-${tutor.name.replace(/\s/g, '')}-${Date.now()}`
    const newBooking: Booking = {
      id: Date.now(),
      studentName: 'Гость (MVP)',
      studentPhone: '+996 700 000 000',
      tutorId: tutor.id,
      tutorName: tutor.name,
      subject: tutor.subject,
      level: tutor.level,
      date: new Date().toISOString().split('T')[0],
      time: selectedSlot,
      status: 'pending',
      jitsiRoom,
      createdAt: new Date().toISOString()
    }

    const existing = JSON.parse(localStorage.getItem('mk_bookings') || '[]')
    localStorage.setItem('mk_bookings', JSON.stringify([...existing, newBooking]))

    setIsBooked(true)
    setTimeout(() => {
      setIsBooked(false)
      setIsModalOpen(false)
      setSelectedSlot(null)
      router.push('/')
    }, 2000)
  }

  return (
    // ✅ Добавлен контейнер с рамкой как на главной
    <main className="min-h-screen bg-gray-100 max-w-md mx-auto shadow-2xl pb-24">
      
      {/* Шапка */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100">←</Link>
        <h1 className="font-semibold text-gray-900 truncate">{tutor.name}</h1>
      </header>

      {/* Профиль */}
      <div className="bg-white px-4 py-6 text-center border-b border-gray-200">
        <img src={tutor.photo_url} alt={tutor.name} className="w-20 h-20 rounded-full mx-auto object-cover ring-4 ring-indigo-100 mb-3" />
        <h2 className="text-xl font-bold text-gray-900">{tutor.name}</h2>
        <div className="flex items-center justify-center gap-2 mt-1 text-sm text-gray-500">
          <span className="text-amber-500">⭐ {tutor.rating}</span>
          <span>• {tutor.reviews_count} отзывов</span>
          <span>• 📍 {tutor.district}</span>
        </div>
      </div>

      {/* Табы — ✅ "Запись" заменено на "Выбрать время" */}
      <div className="bg-white border-b border-gray-200 sticky top-[60px] z-30">
        <div className="flex">
          {(['about', 'reviews', 'booking'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === tab ? 'text-indigo-600' : 'text-gray-500'}`}>
              {tab === 'about' ? 'Обо мне' : tab === 'reviews' ? 'Отзывы' : 'Выбрать время'}
              {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Контент */}
      <div className="p-4 space-y-4">
        {activeTab === 'about' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 space-y-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">О репетиторе</h3>
            <p className="text-gray-800 leading-relaxed">{tutor.bio}</p>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mt-3">Образование</h3>
            <p className="text-gray-800">{tutor.education}</p>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mt-3">Предмет</h3>
            <p className="text-gray-800 font-medium">{tutor.subject} • {tutor.level}</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-3">
            {tutor.reviews.map(r => (
              <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">{r.author}</span>
                  <span className="text-xs text-gray-400">{r.date}</span>
                </div>
                <div className="text-amber-500 text-sm mb-2">{'⭐'.repeat(r.rating)}</div>
                <p className="text-gray-700 text-sm leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'booking' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 space-y-4">
            <h3 className="font-bold text-gray-900">1. Выберите время</h3>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map(slot => (
                <button key={slot} onClick={() => setSelectedSlot(slot)}
                  className={`py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedSlot === slot ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                  {slot}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center">Нажмите на слот, чтобы выбрать</p>
          </div>
        )}
      </div>

      {/* ✅ Нижние кнопки: компактные, не перекрывают контент */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 max-w-md mx-auto">
        <div className="space-y-2">
          {/* Кнопка Jitsi — вторичная, компактная */}
          <Link href={`/lesson/${tutor.id}`} 
            className="w-full bg-white text-green-600 border-2 border-green-200 py-2.5 rounded-xl font-medium text-sm hover:bg-green-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            📹 Тест видеозвонка
          </Link>
          
          {/* Кнопка записи — основная, с чётким состоянием disabled */}
          <button 
            onClick={() => selectedSlot && setIsModalOpen(true)} 
            disabled={!selectedSlot}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all shadow-sm ${
              selectedSlot 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 active:scale-[0.98]' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300'
            }`}>
            {selectedSlot ? `Подтвердить на ${selectedSlot}` : 'Сначала выберите время'}
          </button>
        </div>
      </div>

      {/* Модальное окно подтверждения */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Подтверждение записи</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-4 text-sm">
              <p>👤 <strong>{tutor.name}</strong></p>
              <p>📚 {tutor.subject} • {tutor.level}</p>
              <p>📅 Сегодня, <strong className="text-indigo-600">{selectedSlot}</strong></p>
              <p>💰 {tutor.price} сом</p>
            </div>

            <button 
              onClick={handleBook} 
              disabled={isBooked}
              className={`w-full py-3.5 rounded-xl font-semibold transition-all ${
                isBooked ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]'
              }`}>
              {isBooked ? '✅ Заявка отправлена!' : 'Подтвердить запись'}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}