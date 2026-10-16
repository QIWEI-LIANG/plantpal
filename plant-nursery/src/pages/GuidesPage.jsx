import { useState } from 'react'
import PageHeading from '../components/PageHeading'
import SearchField from '../components/SearchField'
import PlantCard from '../components/PlantCard'
import AsyncState from '../components/AsyncState'
import Icon from '../components/Icon'
import useApiResource from '../hooks/useApiResource'

export default function GuidesPage({ t, language, onSpecies, onNavigate }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const resource = useApiResource(
    '/species/?search=' +
      encodeURIComponent(query.trim()) +
      '&category=' +
      filter,
    { all: true },
  )
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
              '搜索中文名、英文名或学名，点击品种查看指南并添加一盆植物。',
              'Search by Chinese, English or scientific name. Open a species to read its guide and add a plant.',
            )}
          </p>
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t(
              '搜索植物，例如：绿萝 / Pothos',
              'Search plants, e.g. Pothos / 绿萝',
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
          {resource.data?.length || 0} {t('份指南', 'guides')}
        </span>
      </div>
      <AsyncState
        {...resource}
        onRetry={resource.reload}
        t={t}
        language={language}
      />
      {resource.data && (
        <div className="plant-grid">
          {resource.data.map((plant) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              language={language}
              t={t}
              onClick={onSpecies}
              guide
            />
          ))}
        </div>
      )}
      {resource.data?.length === 0 && (
        <div className="empty-state">
          <h3>{t('没有找到匹配的品种', 'No matching species')}</h3>
          <p>
            {t(
              '试试其他名称或清除筛选；首次运行请初始化品种数据。',
              'Try another name or clear the filters. Seed species data on first setup.',
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
              '植物识别待接入，目前可以预览图片并手动选品种。',
              'Identification is coming later. Preview a photo and choose a species manually.',
            )}
          </p>
        </div>
        <button
          className="button secondary"
          onClick={() => onNavigate('identify')}
        >
          {t('查看识别页面', 'Open identification')}
        </button>
      </div>
    </>
  )
}
