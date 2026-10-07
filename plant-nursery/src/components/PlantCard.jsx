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
  return (
    <button className="plant-card" onClick={() => onClick(plant)}>
      <div className="plant-card-image" style={{ background: plant.color }}>
        <span className={`plant-badge ${status === 'check' ? 'amber' : ''}`}>
          {guide
            ? localize(plant.difficulty, language)
            : status === 'check'
              ? t('待检查', 'Check due')
              : t('已安排检查', 'Check scheduled')}
        </span>
        <PlantArt type={plant.type} />
        <span className="plant-open">
          <Icon name="arrow" size={17} />
        </span>
      </div>
      <div className="plant-card-copy">
        <h3>{localize(plant.name, language)}</h3>
        <p className="scientific">{plant.scientific}</p>
        <div className="plant-meta">
          <Icon name={guide ? 'sun' : 'location'} size={15} />
          {localize(guide ? plant.light : plant.location, language)}
        </div>
      </div>
    </button>
  )
}
