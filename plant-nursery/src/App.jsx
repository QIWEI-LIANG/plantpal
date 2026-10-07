import { useEffect, useState } from 'react'
import AppLayout from './components/AppLayout'
import PlantDetails from './components/PlantDetails'
import CareReminder from './components/CareReminder'
import HomePage from './pages/HomePage'
import MyPlantsPage from './pages/MyPlantsPage'
import GuidesPage from './pages/GuidesPage'
import RemindersPage from './pages/RemindersPage'
import IdentifyPage from './pages/IdentifyPage'
import FriendsPage from './pages/FriendsPage'
import ForumPage from './pages/ForumPage'
import SettingsPage from './pages/SettingsPage'
import { plantData } from './data/plantData'
import { loadState, saveState } from './data/stateStorage'

export default function App() {
  const [state, setState] = useState(loadState)
  const [page, setPage] = useState('home')
  const [view, setView] = useState('owner')
  const [selectedPlant, setSelectedPlant] = useState(null)
  const [reminderPlant, setReminderPlant] = useState(null)
  const [toast, setToast] = useState('')
  const [currentTime, setCurrentTime] = useState(() => Date.now())
  const language = state.language
  const t = (zh, en) => (language === 'zh' ? zh : en)
  const myPlants = plantData.filter((plant) =>
    state.plantIds.includes(plant.id),
  )
  const duePlants = myPlants.filter(
    (plant) =>
      new Date(state.reminders[plant.id] || 0).getTime() <= currentTime,
  )

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(Date.now()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
    document.title =
      language === 'zh'
        ? 'Plant Pal · 你的绿色日常'
        : 'Plant Pal · Your green everyday'
  }, [language])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 5000)
    return () => window.clearTimeout(timer)
  }, [toast])

  function addPlant(plant) {
    if (view === 'caretaker') {
      setToast(
        t(
          '请切换为主人添加植物。代管者可以查看和记录养护。',
          'Switch to owner view to add plants. Caretakers can view and record care.',
        ),
      )
      return
    }
    if (state.plantIds.includes(plant.id)) {
      setToast(
        t(
          '这株植物已经在你的花园中了。',
          'This plant is already in your garden.',
        ),
      )
      return
    }
    const now = new Date()
    setCurrentTime(now.getTime())
    setState((previous) => ({
      ...previous,
      plantIds: [...previous.plantIds, plant.id],
      reminders: {
        ...previous.reminders,
        [plant.id]: now.toISOString(),
      },
    }))
    setToast(
      t(
        `已将${plant.name.zh}加入我的植物，可以开始首次检查了。`,
        `${plant.name.en} added. Ready for your first check.`,
      ),
    )
  }

  function recordCare(plant, outcome, observation) {
    const now = new Date()
    setCurrentTime(now.getTime())
    // 稍后检查推迟两小时；其他结果安排明天再检查，并不是固定浇水周期。
    const nextCheck = new Date(
      now.getTime() + (outcome === 'later' ? 2 : 24) * 60 * 60 * 1000,
    )
    const entry = {
      id: crypto.randomUUID(),
      plantId: plant.id,
      outcome,
      observation,
      timestamp: now.toISOString(),
      actor: view === 'owner' ? state.profile.nickname : 'Alex',
      role: view,
    }
    setState((previous) => ({
      ...previous,
      history: [entry, ...previous.history],
      reminders: { ...previous.reminders, [plant.id]: nextCheck.toISOString() },
    }))
    setReminderPlant(null)
    setToast(
      outcome === 'later'
        ? t(
            '已记录检查，2 小时后再检查。可在植物详情中查看记录。',
            'Check recorded. Check again in 2 hours. See the plant history.',
          )
        : t(
            '已保存带时间的养护记录，明天再检查。',
            'Care history saved with a timestamp. Check again tomorrow.',
          ),
    )
  }

  const shared = {
    t,
    language,
    myPlants,
    state,
    view,
    currentTime,
    onPlant: setSelectedPlant,
    onCare: (plant) => {
      setSelectedPlant(null)
      setReminderPlant(plant)
    },
    onNavigate: setPage,
    notify: setToast,
  }
  let content
  switch (page) {
    case 'plants':
      content = <MyPlantsPage {...shared} />
      break
    case 'reminders':
      content = <RemindersPage {...shared} duePlants={duePlants} />
      break
    case 'guides':
      content = <GuidesPage {...shared} />
      break
    case 'identify':
      content = <IdentifyPage {...shared} onAdd={addPlant} />
      break
    case 'friends':
      content = <FriendsPage {...shared} onUpdate={setState} />
      break
    case 'forum':
      content = <ForumPage {...shared} onUpdate={setState} />
      break
    case 'settings':
      content = <SettingsPage {...shared} onUpdate={setState} />
      break
    default:
      content = <HomePage {...shared} duePlants={duePlants} />
  }

  return (
    <AppLayout
      page={page}
      onNavigate={setPage}
      t={t}
      language={language}
      profile={state.profile}
      dueCount={duePlants.length}
      view={view}
      onViewChange={setView}
      onLanguageChange={(value) =>
        setState((previous) => ({ ...previous, language: value }))
      }
    >
      {content}
      {selectedPlant && (
        <PlantDetails
          key={selectedPlant.id}
          plant={selectedPlant}
          {...shared}
          onClose={() => setSelectedPlant(null)}
          onAdd={addPlant}
          onSaveNote={(note) => {
            setState((previous) => ({
              ...previous,
              notes: { ...previous.notes, [selectedPlant.id]: note },
            }))
            setToast(
              t(
                '代管说明已保存。切换到代管者视图即可查看。',
                'Owner instructions saved. View them as a caretaker.',
              ),
            )
          }}
        />
      )}
      {reminderPlant && (
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
