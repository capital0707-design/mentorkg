'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

declare global {
  interface Window {
    JitsiMeetExternalAPI: any
  }
}

export default function LessonRoom() {
  const { id } = useParams()
  const router = useRouter()
  const jitsiContainerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    // Загружаем скрипт Jitsi динамически
    const loadJitsiScript = () => {
      if (window.JitsiMeetExternalAPI) return true
      return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://meet.jit.si/external_api.js'
        script.async = true
        script.onload = () => resolve(true)
        script.onerror = () => reject('Ошибка загрузки Jitsi')
        document.body.appendChild(script)
      })
    }

    loadJitsiScript()
      .then(() => {
        if (!jitsiContainerRef.current) return

        // Генерируем название комнаты (в реальности оно берется из БД брони)
        // Сейчас используем ID из URL как название комнаты
        const roomName = `MentorKG-Lesson-${id}`
        
        const domain = 'meet.jit.si'
        const options = {
          roomName: roomName,
          width: '100%',
          height: '100%', // Занимает весь экран
          parentNode: jitsiContainerRef.current,
          lang: 'ru',
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
              'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
              'videoquality', 'filmstrip', 'tileview', 'download', 'help',
              'mute-everyone', 'security', 'toggle-camera'
            ],
          },
          configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: false,
          },
        }

        const api = new window.JitsiMeetExternalAPI(domain, options)
        
        // Обработчик выхода (крестик)
        api.addEventListeners({
          readyToClose: () => {
            router.push('/') // Возврат на главную после звонка
          },
          videoConferenceLeft: () => {
             router.push('/')
          }
        })

      })
      .catch((err) => {
        console.error(err)
        setError('Не удалось загрузить видео-модуль. Проверьте интернет.')
      })

  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white p-4">
        <div className="text-center">
          <p className="text-xl mb-4">❌ {error}</p>
          <Link href="/" className="bg-indigo-600 px-4 py-2 rounded-lg">На главную</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-black">
      <div ref={jitsiContainerRef} className="w-full h-full" />
    </div>
  )
}