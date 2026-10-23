import { useState } from 'react'
import Modal from './Modal'
import PlantImage from './PlantImage'
import PlantForm from './PlantForm'
import PlantAccessPanel from './PlantAccessPanel'
import HistoryPanel from './HistoryPanel'
import AsyncState from './AsyncState'
import Icon from './Icon'
import useApiResource from '../hooks/useApiResource'
import useMutation from '../hooks/useMutation'
import { api } from '../services/api'
import { formatTime, localize, toLocalDateTime } from '../data/formatters'

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
  const formId = `plant-form-${plantId}`
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
          <div className="detail-intro plant-overview">
            <div
              className="detail-art"
              style={{ background: plant.species.color }}
            >
              <PlantImage plant={plant} />
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
            <aside className="plant-detail-actions">
              {plant.can_edit && (
                <button
                  type="button"
                  className="button danger-outline"
                  onClick={() => setConfirmDelete(true)}
                >
                  {t('删除植物', 'Delete plant')}
                </button>
              )}
              {plant.can_edit ? (
                <label className="next-check-field">
                  {t('下次检查', 'Next check')}
                  <input
                    form={formId}
                    name="next_check_at"
                    type="datetime-local"
                    required
                    defaultValue={toLocalDateTime(plant.next_check_at)}
                  />
                  <small>
                    {t(
                      '修改后点击下方“保存植物资料”。',
                      'Apply with Save plant details below.',
                    )}
                  </small>
                </label>
              ) : (
                <div className="next-check-field">
                  <strong>{t('下次检查', 'Next check')}</strong>
                  <time dateTime={plant.next_check_at}>
                    {formatTime(plant.next_check_at, language)}
                  </time>
                </div>
              )}
            </aside>
          </div>
          {/* 角色来自服务端权限；代管者只读主人说明，写接口仍会再次验证权限。 */}
          {plant.can_edit ? (
            <>
              <h3>{t('编辑这盆植物', 'Edit this plant')}</h3>
              <PlantForm
                formId={formId}
                showSchedule={false}
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
            <button className="button primary" onClick={() => onCare(plant)}>
              <Icon name="drop" />
              {t('检查并记录', 'Check & record')}
            </button>
          </div>
          <HistoryPanel plantId={plant.id} t={t} language={language} />
          {plant.can_edit && (
            <PlantAccessPanel plantId={plant.id} t={t} language={language} />
          )}
        </>
      )}
      {confirmDelete && plant?.can_edit && (
        <Modal
          title={t('确定删除这盆植物？', 'Delete this plant?')}
          t={t}
          className="confirm-dialog"
          onClose={() => {
            if (!deletion.pending) setConfirmDelete(false)
          }}
        >
          <p>
            {t(
              `删除“${plant.nickname}”后，它的养护历史和代管授权也会删除，无法撤销。`,
              `Deleting “${plant.nickname}” also removes its care history and access grants. This cannot be undone.`,
            )}
          </p>
          <AsyncState error={deletion.error} t={t} language={language} />
          <div className="care-actions">
            <button
              className="button secondary"
              disabled={deletion.pending}
              onClick={() => setConfirmDelete(false)}
            >
              {t('取消', 'Cancel')}
            </button>
            <button
              className="button danger"
              disabled={deletion.pending}
              onClick={remove}
            >
              {deletion.pending
                ? t('正在删除…', 'Deleting…')
                : t('确认删除', 'Confirm deletion')}
            </button>
          </div>
        </Modal>
      )}
    </Modal>
  )
}
