import Modal from './Modal'
import PlantArt from './PlantArt'
import PlantForm from './PlantForm'
import Icon from './Icon'
import { localize } from '../data/formatters'
import { api } from '../services/api'

export default function SpeciesDetails({
  species,
  user,
  t,
  language,
  onClose,
  onCreated,
  onLogin,
}) {
  return (
    <Modal
      title={localize(species.name, language)}
      t={t}
      onClose={onClose}
      className="plant-details"
    >
      <div className="detail-intro">
        <div className="detail-art" style={{ background: species.color }}>
          <PlantArt type={species.type} />
        </div>
        <div>
          <span className="tag">{localize(species.difficulty, language)}</span>
          <p className="scientific">{species.scientific}</p>
          <p>{localize(species.tip, language)}</p>
        </div>
      </div>
      <div className="detail-care-grid">
        <div>
          <Icon name="sun" />
          <h3>{t('光照', 'Light')}</h3>
          <p>{localize(species.light, language)}</p>
        </div>
        <div>
          <Icon name="drop" />
          <h3>{t('浇水前', 'Before watering')}</h3>
          <p>{localize(species.water, language)}</p>
        </div>
      </div>
      <p className="notice">{localize(species.check, language)}</p>
      <h3>{t('添加一盆植物', 'Add one plant')}</h3>
      <p className="small-print">
        {t(
          '同一品种可以添加多盆，每盆都有独立资料和养护记录。',
          'Add multiple pots of the same species. Each has its own profile and care history.',
        )}
      </p>
      {user ? (
        <PlantForm
          t={t}
          language={language}
          initial={{ nickname: localize(species.name, language) }}
          submitLabel={t('添加到我的植物', 'Add to my plants')}
          onSubmit={(body) =>
            api('/plants/', {
              method: 'POST',
              body: { ...body, species: species.id },
            })
          }
          onSuccess={onCreated}
        />
      ) : (
        <button className="button primary" onClick={onLogin}>
          {t('登录后添加植物', 'Sign in to add a plant')}
        </button>
      )}
    </Modal>
  )
}
