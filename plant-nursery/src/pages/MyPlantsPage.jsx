import { useState } from 'react'
import PageHeading from '../components/PageHeading'
import SearchField from '../components/SearchField'
import PlantCard from '../components/PlantCard'
import Icon from '../components/Icon'

export default function MyPlantsPage({
  t,
  language,
  myPlants,
  view,
  onPlant,
  onNavigate,
}) {
  const [query, setQuery] = useState('')
  const plants = myPlants.filter((plant) =>
    `${plant.nickname} ${plant.location} ${plant.species.name.zh} ${plant.species.name.en}`
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
            : t('我代管的植物', 'Plants in my care')
        }
        description={t(
          '每一盆植物都有独立资料、位置和养护记录。',
          'Each pot has its own profile, location and care history.',
        )}
        action={
          <button
            className="button primary"
            onClick={() => onNavigate('guides')}
          >
            <Icon name="plus" />
            {t('添加自己的植物', 'Add my own plant')}
          </button>
        }
      />
      <div className="toolbar">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder={t(
            '搜索昵称、位置或品种…',
            'Search nickname, location or species…',
          )}
        />
        <span className="muted">
          {plants.length} {t('盆植物', 'plants')}
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
          />
        ))}
      </div>
      {!plants.length && (
        <div className="empty-state">
          <Icon name="plant" size={36} />
          <h3>{t('这里暂时没有植物', 'No plants here yet')}</h3>
          <p>
            {query
              ? t('试试其他关键词。', 'Try another search.')
              : view === 'caretaker'
                ? t(
                    '需要主人先成为好友，再对某一盆植物明确授权。',
                    'The owner must accept your friendship and explicitly share a plant.',
                  )
                : t(
                    '从养护指南添加第一盆植物。可以添加多盆同品种植物。',
                    'Add your first pot from the guides. Multiple pots of a species are welcome.',
                  )}
          </p>
        </div>
      )}
      {view === 'caretaker' && plants.length > 0 && (
        <section className="panel sitter-overview">
          <h2>{t('交接速览', 'Handover at a glance')}</h2>
          {plants.map((plant) => (
            <div className="handover-row" key={plant.id}>
              <h3>
                {plant.nickname} · {plant.location}
              </h3>
              <small>
                {t('主人', 'Owner')}: {plant.owner.nickname}
              </small>
              <p>
                {plant.owner_notes ||
                  t('暂无主人说明', 'No owner instructions yet')}
              </p>
              <button className="text-button" onClick={() => onPlant(plant)}>
                {t('查看资料与近期记录', 'View profile & recent care')}
                <Icon name="arrow" size={16} />
              </button>
            </div>
          ))}
        </section>
      )}
    </>
  )
}
