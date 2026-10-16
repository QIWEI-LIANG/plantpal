import { useEffect, useState } from 'react'
import AppLayout from './components/AppLayout'
import AsyncState from './components/AsyncState'
import PlantDetails from './components/PlantDetails'
import SpeciesDetails from './components/SpeciesDetails'
import CareReminder from './components/CareReminder'
import HomePage from './pages/HomePage'
import MyPlantsPage from './pages/MyPlantsPage'
import GuidesPage from './pages/GuidesPage'
import RemindersPage from './pages/RemindersPage'
import IdentifyPage from './pages/IdentifyPage'
import FriendsPage from './pages/FriendsPage'
import ForumPage from './pages/ForumPage'
import SettingsPage from './pages/SettingsPage'
import AuthPage from './pages/AuthPage'
import NotificationsPage from './pages/NotificationsPage'
import useSession from './hooks/useSession'
import usePlantData from './hooks/usePlantData'
import { loadLanguage, saveLanguage } from './data/stateStorage'
import { api } from './services/api'

export default function App() {
  const session = useSession()
  const [language, setLanguage] = useState(loadLanguage)
  useEffect(() => {
    saveLanguage(language)
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
    document.title =
      language === 'zh'
        ? 'Plant Pal · 你的绿色日常'
        : 'Plant Pal · Your green everyday'
  }, [language])
  // 账户切换时卸载旧账户的页面与缓存，防止交叉显示上一位用户的数据。
  return (
    <PlantPalWorkspace
      key={session.user?.id || 'guest'}
      session={session}
      language={language}
      setLanguage={setLanguage}
    />
  )
}

function PlantPalWorkspace({ session, language, setLanguage }) {
  const { user } = session
  const [page, setPage] = useState('home')
  const [view, setView] = useState('owner')
  const [plantId, setPlantId] = useState(null)
  const [species, setSpecies] = useState(null)
  const [reminderPlant, setReminderPlant] = useState(null)
  const [toast, setToast] = useState('')
  const data = usePlantData(user, view)
  const t = (zh, en) => (language === 'zh' ? zh : en)
  const duePlants = data.plants.filter(
    (plant) => plant.check_status !== 'scheduled',
  )

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 5000)
    return () => window.clearTimeout(timer)
  }, [toast])

  function openCare(plant) {
    setPlantId(null)
    setReminderPlant(plant)
  }

  async function recordCare(plant, outcome, observation, confirmed) {
    await api('/plants/' + plant.id + '/care/', {
      method: 'POST',
      body: { outcome, observation, confirmed },
    })
    data.refresh()
    setReminderPlant(null)
    setToast(
      outcome === 'later'
        ? t(
            '已保存记录，2 小时后再检查。',
            'Care saved. Check again in 2 hours.',
          )
        : t(
            '已保存记录，24 小时后再检查。',
            'Care saved. Check again in 24 hours.',
          ),
    )
  }

  const shared = {
    t,
    language,
    user,
    view,
    myPlants: data.plants,
    duePlants,
    summary: data.summary,
    history: data.history,
    onPlant: (plant) => setPlantId(plant.id),
    onSpecies: setSpecies,
    onCare: openCare,
    onNavigate: setPage,
    notify: setToast,
    refresh: data.refresh,
  }
  const isPublic = ['guides', 'identify'].includes(page)
  const isCore = ['home', 'plants', 'reminders'].includes(page)
  let content
  if (!isPublic && (session.loading || session.error)) {
    content = (
      <AsyncState
        loading={session.loading}
        error={session.error}
        onRetry={session.retry}
        t={t}
        language={language}
      />
    )
  } else if (!isPublic && !user) {
    content = (
      <AuthPage
        t={t}
        language={language}
        onAuthenticated={session.setUser}
        onNavigate={setPage}
      />
    )
  } else if (isCore && (data.loading || data.error)) {
    content = (
      <AsyncState
        loading={data.loading}
        error={data.error}
        onRetry={data.refresh}
        t={t}
        language={language}
      />
    )
  } else {
    switch (page) {
      case 'plants':
        content = <MyPlantsPage {...shared} />
        break
      case 'guides':
        content = <GuidesPage {...shared} />
        break
      case 'reminders':
        content = <RemindersPage {...shared} scope={data.scope} />
        break
      case 'identify':
        content = <IdentifyPage {...shared} />
        break
      case 'friends':
        content = <FriendsPage {...shared} />
        break
      case 'forum':
        content = <ForumPage {...shared} />
        break
      case 'notifications':
        content = <NotificationsPage {...shared} />
        break
      case 'settings':
        content = (
          <SettingsPage
            {...shared}
            onProfile={session.setUser}
            onLoggedOut={() => session.setUser(null)}
          />
        )
        break
      default:
        content = <HomePage {...shared} />
    }
  }
  return (
    <AppLayout
      page={page}
      onNavigate={setPage}
      t={t}
      language={language}
      onLanguageChange={setLanguage}
      profile={user}
      dueCount={(data.summary?.due || 0) + (data.summary?.overdue || 0)}
      unreadCount={data.summary?.unread || 0}
      view={view}
      onViewChange={(value) => {
        setPlantId(null)
        setReminderPlant(null)
        setView(value)
      }}
    >
      {content}
      {species && (
        <SpeciesDetails
          key={species.id}
          species={species}
          user={user}
          t={t}
          language={language}
          onClose={() => setSpecies(null)}
          onLogin={() => {
            setSpecies(null)
            setPage('home')
          }}
          onCreated={() => {
            setSpecies(null)
            setView('owner')
            setPage('plants')
            data.refresh()
            setToast(
              t(
                '已添加一盆植物，资料保存到了数据库。',
                'Plant added and saved to the database.',
              ),
            )
          }}
        />
      )}
      {plantId && user && (
        <PlantDetails
          key={plantId}
          plantId={plantId}
          t={t}
          language={language}
          onClose={() => setPlantId(null)}
          onCare={openCare}
          onChanged={data.refresh}
          onDeleted={() => {
            setPlantId(null)
            data.refresh()
            setToast(
              t(
                '这盆植物及其养护记录已删除。',
                'Plant and its care records deleted.',
              ),
            )
          }}
        />
      )}
      {reminderPlant && user && (
        <CareReminder
          plant={reminderPlant}
          t={t}
          language={language}
          onClose={() => setReminderPlant(null)}
          onRecord={recordCare}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <span className="toast-check">✓</span>
          {toast}
          <button
            className="icon-button"
            onClick={() => setToast('')}
            aria-label={t('关闭提示', 'Dismiss notification')}
          >
            ×
          </button>
        </div>
      )}
    </AppLayout>
  )
}
