import { useState } from 'react'
import PageHeading from '../components/PageHeading'
import SearchField from '../components/SearchField'
import PlantCard from '../components/PlantCard'
import Icon from '../components/Icon'
import { plantData } from '../data/plantData'

export default function GuidesPage({ t, language, onPlant, onNavigate }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const filtered = plantData.filter((plant) => {
    const matches = `${plant.name.zh} ${plant.name.en} ${plant.scientific}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
    return (
      matches &&
      (filter === 'all' ||
        (filter === 'easy'
          ? ['snake', 'zz', 'pothos', 'monstera'].includes(plant.id)
          : ['snake', 'zz'].includes(plant.id)))
    )
  })
  return (
    <>
      <PageHeading
        eyebrow="A LITTLE KNOW-HOW"
        title={t('养护指南', 'Plant guides')}
        description={t(
          '认识你的植物，从一份简单的养护指南开始。',
          'Get to know your plant with a simple, specific care guide.',
        )}
      />
      <div className="guide-search-banner">
        <Icon name="book" size={34} />
        <div>
          <h2>
            {t('你的下一株绿色伙伴是谁？', 'Who’s your next green companion?')}
          </h2>
          <p>
            {t(
              '搜索中文名、英文名或学名，点击植物查看养护建议。',
              'Search by Chinese, English, or scientific name. Open a card for care notes.',
            )}
          </p>
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t(
              '搜索植物，例如：龟背竹 / Monstera',
              'Search plants, e.g. Monstera / 龟背竹',
            )}
          />
        </div>
      </div>
      <div className="toolbar">
        <div className="filter-tabs">
          {[
            ['all', '全部植物', 'All plants'],
            ['easy', '新手友好', 'Beginner friendly'],
            ['dry', '耐旱伙伴', 'Drought tolerant'],
          ].map(([id, zh, en]) => (
            <button
              key={id}
              className={filter === id ? 'selected' : ''}
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
            >
              {t(zh, en)}
            </button>
          ))}
        </div>
        <span className="muted">
          {filtered.length} {t('份指南', 'guides')}
        </span>
      </div>
      <div className="plant-grid">
        {filtered.map((plant) => (
          <PlantCard
            key={plant.id}
            plant={plant}
            language={language}
            t={t}
            onClick={onPlant}
            guide
          />
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <h3>{t('没有找到匹配的植物', 'No matching plants')}</h3>
          <p>
            {t(
              '目前收录 6 种室内植物，试试其他名称或“全部植物”。',
              'Six indoor plants are included. Try another name or select “All plants”.',
            )}
          </p>
          <button
            className="button secondary"
            onClick={() => {
              setQuery('')
              setFilter('all')
            }}
          >
            {t('清除筛选', 'Clear filters')}
          </button>
        </div>
      )}
      <div className="discover-banner">
        <Icon name="scan" size={28} />
        <div>
          <h3>{t('只有照片，没有名字？', 'A photo, but no name?')}</h3>
          <p>
            {t(
              '可以体验明确标注的示例识别流程。',
              'Explore the clearly labeled demonstration flow.',
            )}
          </p>
        </div>
        <button
          className="button secondary"
          onClick={() => onNavigate('identify')}
        >
          {t('示例识别', 'Demo identification')}
        </button>
      </div>
    </>
  )
}
