import { useState } from 'react'
import PageHeading from '../components/PageHeading'
import SearchField from '../components/SearchField'
import PlantCard from '../components/PlantCard'
import Icon from '../components/Icon'
import { localize } from '../data/formatters'

export default function MyPlantsPage({
  t,
  language,
  myPlants,
  state,
  view,
  currentTime,
  onPlant,
  onNavigate,
}) {
  const [query, setQuery] = useState('')
  const plants = myPlants.filter((plant) =>
    `${plant.name.zh} ${plant.name.en} ${plant.scientific}`
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  )
  return (
    <>
      <PageHeading
        eyebrow="YOUR LITTLE JUNGLE"
        title={
          view === 'owner'
            ? t('我的植物', 'My plants')
            : t(
                `${state.profile.nickname} 的植物`,
                `${state.profile.nickname}’s plants`,
              )
        }
        description={
          view === 'owner'
            ? t(
                '查看植物资料、保存交接说明，留住每一次养护。',
                'Plant profiles, owner instructions, and every moment of care.',
              )
            : t(
                '点击植物，查看主人说明与最近的养护记录。',
                'Open a plant to read the owner’s instructions and recent care history.',
              )
        }
        action={
          view === 'owner' && (
            <button
              className="button primary"
              onClick={() => onNavigate('guides')}
            >
              <Icon name="plus" />
              {t('添加植物', 'Add a plant')}
            </button>
          )
        }
      />
      <div className="toolbar">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder={t('搜索我的植物…', 'Search my plants…')}
        />
        <span className="muted">
          {plants.length} {t('株植物', 'plants')}
        </span>
      </div>
      <div className="plant-grid">
        {plants.map((plant) => (
          <PlantCard
            key={plant.id}
            plant={plant}
            t={t}
            language={language}
            onClick={onPlant}
            status={
              new Date(state.reminders[plant.id] || 0).getTime() <= currentTime
                ? 'check'
                : 'done'
            }
          />
        ))}
      </div>
      {!plants.length && (
        <div className="empty-state">
          <Icon name="plant" size={36} />
          <h3>{t('这里暂时没有植物', 'No plants here yet')}</h3>
          <p>
            {query
              ? t(
                  '试试中文、英文或学名。',
                  'Try a Chinese name, English name, or scientific name.',
                )
              : t(
                  '去养护指南挑选你的第一株植物。',
                  'Find your first plant in the guides.',
                )}
          </p>
          <button
            className="button secondary"
            onClick={() => onNavigate('guides')}
          >
            {t('浏览指南', 'Browse guides')}
          </button>
        </div>
      )}
      <p className="small-print">
        {t(
          '状态代表检查安排，不是自动诊断植物健康。',
          'Statuses describe check schedules, not an automatic diagnosis of plant health.',
        )}
      </p>
      {view === 'caretaker' && (
        <section className="panel sitter-overview">
          <h2>{t('交接速览', 'Handover at a glance')}</h2>
          {plants.map((plant) => (
            <div className="handover-row" key={plant.id}>
              <h3>{localize(plant.name, language)}</h3>
              <p>
                {localize(state.notes[plant.id] ?? plant.note, language) ||
                  t('暂无主人说明', 'No owner instructions yet')}
              </p>
              <button className="text-button" onClick={() => onPlant(plant)}>
                {t('查看近期记录', 'View recent history')}
                <Icon name="arrow" size={16} />
              </button>
            </div>
          ))}
        </section>
      )}
    </>
  )
}
