import PlantArt from './PlantArt'
import Icon from './Icon'
import { localize } from '../data/formatters'

export default function PlantCard({
  plant,
  language,
  t,
  onClick,
  status,
  guide = false,
}) {
  const species = guide ? plant : plant.species
  const currentStatus = status || plant.check_status
  return (
    <button className="plant-card" onClick={() => onClick(plant)}>
      <div className="plant-card-image" style={{ background: species.color }}>
        <span
          className={`plant-badge ${['due', 'overdue'].includes(currentStatus) ? 'amber' : ''}`}
        >
          {guide
            ? localize(species.difficulty, language)
            : currentStatus === 'overdue'
              ? t('已逾期', 'Overdue')
              : currentStatus === 'due'
                ? t('待检查', 'Check due')
                : t('已安排检查', 'Check scheduled')}
        </span>
        <PlantArt type={species.type} />
        <span className="plant-open">
          <Icon name="arrow" size={17} />
        </span>
      </div>
      <div className="plant-card-copy">
        <h3>{guide ? localize(species.name, language) : plant.nickname}</h3>
        <p className="scientific">
          {guide
            ? species.scientific
            : localize(species.name, language) + ' · ' + species.scientific}
        </p>
        <div className="plant-meta">
          <Icon name={guide ? 'sun' : 'location'} size={15} />
          {guide ? localize(species.light, language) : plant.location}
        </div>
        {!guide && !plant.can_edit && (
          <p className="small-print">
            {t('主人', 'Owner')}: {plant.owner.nickname}
          </p>
        )}
      </div>
    </button>
  )
}
