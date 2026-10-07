import { plantData } from './plantData'

const storageKey = 'plant-pal-v1'

function initialState() {
  const now = Date.now()
  const tomorrow = new Date(now + 24 * 60 * 60 * 1000).toISOString()
  return {
    language: 'zh',
    profile: { nickname: 'Qiwei', email: 'Qiwei@example.com' },
    plantIds: ['monstera', 'pothos', 'snake', 'rubber'],
    notes: Object.fromEntries(plantData.map((plant) => [plant.id, plant.note])),
    reminders: {
      monstera: new Date(now).toISOString(),
      pothos: new Date(now).toISOString(),
      snake: tomorrow,
      rubber: tomorrow,
    },
    history: [
      {
        id: 'seed-1',
        plantId: 'snake',
        outcome: 'skipped',
        observation: 'damp',
        timestamp: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
        actor: 'Jamie',
        role: 'owner',
      },
      {
        id: 'seed-2',
        plantId: 'rubber',
        outcome: 'watered',
        observation: 'dry',
        timestamp: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
        actor: 'Jamie',
        role: 'owner',
      },
      {
        id: 'seed-3',
        plantId: 'monstera',
        outcome: 'watered',
        observation: 'dry',
        timestamp: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'Jamie',
        role: 'owner',
      },
    ],
    friendIds: ['mia', 'alex'],
    likedPostIds: [],
  }
}

export function loadState() {
  const defaults = initialState()
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey))
    if (
      !saved ||
      !Array.isArray(saved.plantIds) ||
      !Array.isArray(saved.history)
    )
      return defaults
    const validIds = plantData.map((plant) => plant.id)
    // 防止损坏的本地记录让页面崩溃；不合格时恢复内置示例。
    if (
      !saved.history.every(
        (entry) =>
          validIds.includes(entry.plantId) &&
          ['watered', 'skipped', 'later'].includes(entry.outcome) &&
          Number.isFinite(Date.parse(entry.timestamp)),
      )
    )
      return defaults
    if (
      !saved.profile ||
      typeof saved.profile.nickname !== 'string' ||
      typeof saved.profile.email !== 'string'
    )
      return defaults
    if (
      !saved.notes ||
      !saved.reminders ||
      !Array.isArray(saved.friendIds) ||
      !Array.isArray(saved.likedPostIds)
    )
      return defaults
    if (
      !Object.values(saved.notes).every(
        (note) =>
          typeof note === 'string' ||
          (note && typeof note.zh === 'string' && typeof note.en === 'string'),
      )
    )
      return defaults
    if (
      !Object.values(saved.reminders).every((date) =>
        Number.isFinite(Date.parse(date)),
      )
    )
      return defaults
    return {
      ...defaults,
      ...saved,
      language: saved.language === 'en' ? 'en' : 'zh',
      plantIds: saved.plantIds.filter((id) => validIds.includes(id)),
    }
  } catch {
    return defaults
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}
