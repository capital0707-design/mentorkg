// Категории и предметы из вашего ТЗ
export const categories = [
  { id: 'languages', name: '🗣 Языки', subjects: ['Английский', 'Русский язык', 'Немецкий', 'Японский', 'Корейский', 'Турецкий'] },
  { id: 'preschool', name: '🧸 Подготовка к школе', subjects: ['Подготовка к 1 классу', 'Развитие речи', 'Счёт и логика', 'Раннее развитие'] },
  { id: 'school', name: '📚 Школьная программа', subjects: ['Математика', 'Физика', 'Химия', 'Биология', 'Информатика', 'История'] },
  { id: 'exams', name: '🎓 Экзамены', subjects: ['ОРТ/НЦТ', 'ЕГЭ', 'IELTS/TOEFL', 'Вузовская подготовка'] },
  { id: 'it', name: '💻 IT и цифровые навыки', subjects: ['Python', 'Веб-разработка', 'Excel', 'Основы программирования'] },
  { id: 'speech', name: '🗣️ Логопед', subjects: ['Коррекция речи', 'Постановка звуков', 'Логопедия взрослых'] },
  { id: 'business', name: '💼 Бизнес', subjects: ['Английский для бизнеса', 'Финансы', 'Soft skills'] }
]

// Простая структура репетитора
export const tutors = [
  {
    id: 1,
    name: 'Анна Каримова',
    photo_url: 'https://i.pravatar.cc/150?u=anna',
    rating: 4.9,
    reviews_count: 23,
    district: 'Октябрьский',
    bio: 'Математика для школьников. Подготовка к ОРТ.',
    education: 'КГУ, Физ-мат, 2019',
    category: 'school',
    subject: 'Математика',
    level: '5-9 класс',
    price: 700,
    formats: ['online', 'offline'],
    reviews: [{ id: 1, author: 'Мария П.', text: 'Отлично объясняет!', rating: 5, date: '12.05.2026' }]
  },
  {
    id: 2,
    name: 'Руслан Асанов',
    photo_url: 'https://i.pravatar.cc/150?u=ruslan',
    rating: 4.7,
    reviews_count: 15,
    district: 'Свердловский',
    bio: 'Физика через эксперименты и аналогии.',
    education: 'КНУ, Физфак',
    category: 'school',
    subject: 'Физика',
    level: '7-9 класс',
    price: 600,
    formats: ['online', 'offline'],
    reviews: [{ id: 2, author: 'Дамир А.', text: 'Понял кинематику!', rating: 4, date: '10.05.2026' }]
  },
  {
    id: 3,
    name: 'Елена Волкова',
    photo_url: 'https://i.pravatar.cc/150?u=elena',
    rating: 5.0,
    reviews_count: 41,
    district: 'Первомайский',
    bio: 'Английский для бизнеса и IELTS.',
    education: 'British Council Certified',
    category: 'languages',
    subject: 'Английский',
    level: 'Взрослые / IELTS',
    price: 900,
    formats: ['online', 'micro'],
    reviews: [{ id: 3, author: 'Айгуль Т.', text: 'IELTS 7.5!', rating: 5, date: '18.05.2026' }]
  },
  {
    id: 4,
    name: 'Бакыт Жумабеков',
    photo_url: 'https://i.pravatar.cc/150?u=bakyt',
    rating: 4.8,
    reviews_count: 19,
    district: 'Ленинский',
    bio: 'ОРТ/НЦТ по математике и физике.',
    education: 'КРСУ, Математика',
    category: 'exams',
    subject: 'ОРТ/НЦТ',
    level: '11 класс',
    price: 800,
    formats: ['online', 'offline'],
    reviews: [{ id: 4, author: 'Эрлан К.', text: '92 балла!', rating: 5, date: '15.05.2026' }]
  }
]