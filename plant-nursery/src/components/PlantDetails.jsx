import { useState } from 'react'
import Modal from './Modal'
import PlantArt from './PlantArt'
import PlantForm from './PlantForm'
import PlantAccessPanel from './PlantAccessPanel'
import HistoryPanel from './HistoryPanel'
import AsyncState from './AsyncState'
import Icon from './Icon'
import useApiResource from '../hooks/useApiResource'
import useMutation from '../hooks/useMutation'
import { api } from '../services/api'
import { formatTime, localize } from '../data/formatters'

export default function PlantDetails({
  plantId,
  language,
  t,
  onClose,
  onCare,
  onChanged,
  onDeleted,
}) {
  const resource = useApiResource('/plants/' + plantId + '/', { poll: 15000 })
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [message, setMessage] = useState('')
  const deletion = useMutation()
  const plant = resource.data
  async function remove() {
    const result = await deletion.run(() =>
      api('/plants/' + plantId + '/', { method: 'DELETE' }),
    )
    if (result.ok) onDeleted()
  }
  return (
    <Modal
      title={plant?.nickname || t('植物详情', 'Plant details')}
      t={t}
      onClose={onClose}
      className="plant-details"
    >
      <AsyncState
        {...resource}
        onRetry={resource.reload}
        t={t}
        language={language}
      />
      {plant && (
        <>
          <div className="detail-intro">
            <div
              className="detail-art"
              style={{ background: plant.species.color }}
            >
              <PlantArt type={plant.species.type} />
            </div>
            <div>
              <span className="tag">
                {localize(plant.species.name, language)}
              </span>
              <p className="scientific">{plant.species.scientific}</p>
              <p>
                <Icon name="location" size={16} /> {plant.location}
              </p>
              <p className="muted">
                {t('主人', 'Owner')}: {plant.owner.nickname} (@
                {plant.owner.username})
              </p>
            </div>
          </div>
          <div className="detail-care-grid">
            <div>
              <Icon name="sun" />
              <h3>{t('光照', 'Light')}</h3>
              <p>{localize(plant.species.light, language)}</p>
            </div>
            <div>
              <Icon name="drop" />
              <h3>{t('浇水前', 'Before watering')}</h3>
              <p>{localize(plant.species.water, language)}</p>
            </div>
          </div>
          <p className="notice">{localize(plant.species.check, language)}</p>
          {/* 角色来自服务端权限；代管者只读主人说明，写接口仍会再次验证权限。 */}
          {plant.can_edit ? (
            <>
              <h3>{t('编辑这盆植物', 'Edit this plant')}</h3>
              <PlantForm
                initial={plant}
                t={t}
                language={language}
                submitLabel={t('保存植物资料', 'Save plant details')}
                onSubmit={(body) =>
                  api('/plants/' + plant.id + '/', { method: 'PATCH', body })
                }
                onSuccess={() => {
                  resource.reload()
                  onChanged()
                  setMessage(t('植物资料已保存。', 'Plant details saved.'))
                }}
              />
            </>
          ) : (
            <>
              <h3>{t('主人说明', 'Owner instructions')}</h3>
              <p className="owner-note">
                {plant.owner_notes ||
                  t(
                    '主人还没有填写说明，不确定时请联系主人。',
                    'No instructions yet. Contact the owner if unsure.',
                  )}
              </p>
            </>
          )}
          {message && (
            <p className="notice" role="status">
              {message}
            </p>
          )}
          <div className="detail-bottom">
            <p className="muted">
              {t('下次检查', 'Next check')}:{' '}
              {formatTime(plant.next_check_at, language)}
            </p>
            <button className="button primary" onClick={() => onCare(plant)}>
              <Icon name="drop" />
              {t('检查并记录', 'Check & record')}
            </button>
          </div>
          <HistoryPanel plantId={plant.id} t={t} language={language} />
          {plant.can_edit && (
            <>
              <PlantAccessPanel plantId={plant.id} t={t} language={language} />
              <div className="delete-panel">
                {confirmDelete ? (
                  <>
                    <p>
                      {t(
                        '确定删除这盆植物？它的养护历史和代管授权也会删除，无法撤销。',
                        'Delete this plant? Its care history and access grants will also be deleted. This cannot be undone.',
                      )}
                    </p>
                    <div className="care-actions">
                      <button
                        className="button danger"
                        disabled={deletion.pending}
                        onClick={remove}
                      >
                        {t('确认删除', 'Confirm deletion')}
                      </button>
                      <button
                        className="button secondary"
                        disabled={deletion.pending}
                        onClick={() => setConfirmDelete(false)}
                      >
                        {t('取消', 'Cancel')}
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    className="button secondary"
                    onClick={() => setConfirmDelete(true)}
                  >
                    {t('删除这盆植物', 'Delete this plant')}
                  </button>
                )}
                <AsyncState error={deletion.error} t={t} language={language} />
              </div>
            </>
          )}
        </>
      )}
    </Modal>
  )
}
