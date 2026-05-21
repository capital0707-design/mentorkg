// lib/auth.ts
export type UserRole = 'student' | 'tutor' | 'admin'

export interface User {
  id: string
  name: string
  phone: string
  role: UserRole
  createdAt: string
  // Для репетиторов:
  tutorData?: {
    subject: string
    level: string
    price: number
    formats: string[]
    district: string
    bio: string
    education: string
    photo_url: string
    isApproved: boolean
  }
}

const USERS_KEY = 'mk_users'
const CURRENT_USER_KEY = 'mk_current_user'

export const auth = {
  // Регистрация
  register: (userData: Omit<User, 'id' | 'createdAt'> & { password: string }): User => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    if (users.find((u: User) => u.phone === userData.phone)) {
      throw new Error('Пользователь с таким телефоном уже существует')
    }
    
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]))
    return newUser
  },

  // Вход
  login: (phone: string, password: string): User => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    const user = users.find((u: User & { password?: string }) => 
      u.phone === phone && u.password === password
    )
    if (!user) throw new Error('Неверный телефон или пароль')
    
    const { password: _, ...userWithoutPass } = user
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPass))
    return userWithoutPass
  },

  // Выход
  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY)
  },

  // Получить текущего пользователя
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(CURRENT_USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  },

  // Проверка авторизации
  isAuthenticated: () => !!auth.getCurrentUser(),

  // Обновить данные пользователя (для репетиторов после одобрения)
  updateUser: (userId: string, updates: Partial<User>) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    const index = users.findIndex((u: User) => u.id === userId)
    if (index === -1) return null
    users[index] = { ...users[index], ...updates }
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    
    const current = auth.getCurrentUser()
    if (current?.id === userId) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ ...current, ...updates }))
    }
    return users[index]
  }
}