'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { tutors } from '@/lib/mock-data'
import Link from 'next/link'

const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '18:00', '19:00']

// 📞 Функция маски телефона: +996 XXX XXX XXX
const formatPhone = (value: string) => {
  // Оставляем только цифры
  const digits = value.replace(/\D/g, '')
  // Убираем 996, если пользователь начал вводить с него
  const clean = digits.startsWith('996') ? digits.slice(3) : digits
  // Берём только 9 цифр (без кода страны)
  const limited = clean.slice(0, 9)
  
  const p1 = limited.slice(0, 3)
  const p2 = limited.slice(3, 6)
  const p3 = limited.slice(6, 9)
  
  let result = '+996'
  if (p1) result += ` ${p1}`
  if (p2) result += ` ${p2}`
  if (p3) result += ` ${p3}`
  
  return result
}

export default function TutorProfile() {
  const router = useRouter()
  const { id } = useParams()
  const tutorId = parseInt(id as string || '1')
  const tutor = tutors.find(t => t.id === tutorId) || tutors[0]

  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'booking'>('about')
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBooked, setIsBooked] = useState(false)

  // Состояния для формы ученика
  const [studentName, setStudentName] = useState('')
  const [studentPhone, setStudentPhone] = useState('')
  const [lessonLinkForStudent, setLessonLinkForStudent] = useState<string | null>(null)

  if (!tutor) return <div className="p-8 text-center">Репетитор не найден</div>

  const handleBook = () => {
    if (!selectedSlot || !studentName || !studentPhone) return

    // Генерируем уникальную комнату
    const jitsiRoom = `MentorKG-${tutor.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const lessonLink = `https://meet.jit.si/${jitsiRoom}`

    const newBooking = {
      id: Date.now(),
      studentName: studentName,
      studentPhone: studentPhone, // Тут уже отформатированный номер
      tutorId: tutor.id,
      tutorName: tutor.name,
      subject: tutor.subject,
      level: tutor.level,
      date: new Date().toISOString().split('T')[0],
      time: selectedSlot,
      status: 'pending',
      jitsiRoom: jitsiRoom,
      lessonLink: lessonLink,
      createdAt: new Date().toISOString()
    }

    const existing = JSON.parse(localStorage.getItem('mk_bookings') || '[]')
    localStorage.setItem('mk_bookings', JSON.stringify([...existing, newBooking]))

    setLessonLinkForStudent(lessonLink)
    setIsBooked(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setIsBooked(false)
    setSelectedSlot(null)
    setStudentName('')
    setStudentPhone('')
    setLessonLinkForStudent(null)
  }

  return (
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

      {/* Табы */}
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
                <p className="text-gray-700 text-sm">{r.text}</p>
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
          </div>
        )}
      </div>

      {/* Нижние кнопки (✅ КНОПКА ТЕСТА УДАЛЕНА) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-md mx-auto">
        <button 
          onClick={() => { if(selectedSlot) setIsModalOpen(true) }} 
          disabled={!selectedSlot}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
            selectedSlot ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-gray-200 text-gray-500'
          }`}>
          {selectedSlot ? `2. Подтвердить на ${selectedSlot}` : 'Сначала выберите время'}
        </button>
      </div>

      {/* Модальное окно (✅ МАСКА ТЕЛЕФОНА ДОБАВЛЕНА) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-5 animate-slide-up">
            
            {isBooked && lessonLinkForStudent ? (
              <div className="text-center py-2">
                <div className="text-5xl mb-3">✅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Заявка подтверждена!</h3>
                <p className="text-sm text-gray-500 mb-4">Ссылка на видеозвонок:</p>
                
                <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 mb-4 break-all">
                  <p className="text-xs text-indigo-600 font-mono">{lessonLinkForStudent}</p>
                </div>

                <button 
                  onClick={() => navigator.clipboard.writeText(lessonLinkForStudent || '')}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition mb-2"
                >
                  📋 Скопировать ссылку
                </button>
                
                <button onClick={closeModal} className="text-sm text-gray-500 hover:text-gray-700 mt-2">
                  Закрыть
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Запись на урок</h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ваше имя</label>
                    <input 
                      type="text" 
                      placeholder="Иван" 
                      value={studentName}
                      onChange={e => setStudentName(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                    <input 
                      type="tel" 
                      placeholder="+996 ___ ___ ___"
                      value={studentPhone}
                      // ✅ Привязываем маску
                      onChange={e => setStudentPhone(formatPhone(e.target.value))}
                      // ✅ Открывает цифровую клавиатуру на телефоне
                      inputMode="numeric"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleBook} 
                  disabled={!studentName || !studentPhone}
                  className={`w-full py-3.5 rounded-xl font-semibold transition-all ${
                    (studentName && studentPhone)
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}>
                  Подтвердить запись
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}