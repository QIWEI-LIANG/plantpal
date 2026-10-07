import { useState } from 'react'
import Modal from './Modal'
import PlantArt from './PlantArt'
import Icon from './Icon'
import CareHistory from './CareHistory'
import { formatTime, localize } from '../data/formatters'

export default function PlantDetails({
  plant,
  language,
  t,
  state,
  view,
  onClose,
  onAdd,
  onCare,
  onSaveNote,
}) {
  const owned = state.plantIds.includes(plant.id)
  const originalNote = localize(state.notes[plant.id] ?? plant.note, language)
  const [note, setNote] = useState(originalNote)
  const [noteSaved, setNoteSaved] = useState(false)
  const [added, setAdded] = useState(false)
  const history = state.history.filter((entry) => entry.plantId === plant.id)
  return (
    <Modal
      title={localize(plant.name, language)}
      t={t}
      onClose={onClose}
      className="plant-details"
    >
      <div className="detail-intro">
        <div className="detail-art" style={{ background: plant.color }}>
          <PlantArt type={plant.type} />
        </div>
        <div>
          <span className="tag">{localize(plant.difficulty, language)}</span>
          <p className="scientific">{plant.scientific}</p>
          <p className="muted">
            <Icon name="location" size={16} />{' '}
            {localize(plant.location, language)}
          </p>
          <p>
            {t(
              '从观察开始，让照顾更简单。',
              'Start by observing. Grow with confidence.',
            )}
          </p>
        </div>
      </div>
      <div className="detail-care-grid">
        <div>
          <Icon name="sun" />
          <h3>{t('光照', 'Light')}</h3>
          <p>{localize(plant.light, language)}</p>
        </div>
        <div>
          <Icon name="drop" />
          <h3>{t('浇水前', 'Before watering')}</h3>
          <p>{localize(plant.water, language)}</p>
        </div>
      </div>
      <p className="notice">
        <Icon name="leaf" size={18} />
        {localize(plant.tip, language)}
      </p>
      {!owned && (
        <button
          className="button primary full-width"
          onClick={() => {
            onAdd(plant)
            setAdded(true)
          }}
          disabled={view === 'caretaker'}
        >
          <Icon name="plus" />
          {t('加入我的植物', 'Add to my plants')}
        </button>
      )}
      {added && (
        <p className="notice" role="status">
          {t(
            '已加入我的植物，可在下面保存代管说明并记录养护。',
            'Added to my plants. Save owner instructions and record care below.',
          )}
        </p>
      )}
      {owned && (
        <>
          <div className="section-heading">
            <h3>{t('代管说明', 'Owner instructions')}</h3>
            <span className="tag">
              {view === 'owner'
                ? t('主人填写', 'Written by owner')
                : t('供代管者查看', 'For the caretaker')}
            </span>
          </div>
          {view === 'owner' ? (
            <form
              onSubmit={(event) => {
                event.preventDefault()
                onSaveNote(note.trim())
                setNoteSaved(true)
              }}
            >
              <label className="field-label" htmlFor="owner-note">
                {t(
                  '告诉代管者位置、注意事项和不确定时该怎么做。',
                  'Tell the sitter where it belongs, what to check, and what to do if unsure.',
                )}
              </label>
              <textarea
                id="owner-note"
                rows="3"
                maxLength="600"
                value={note}
                onChange={(event) => {
                  setNote(event.target.value)
                  setNoteSaved(false)
                }}
              />
              <div className="note-actions">
                <small className="muted">{note.length}/600</small>
                <button className="button secondary" type="submit">
                  {noteSaved
                    ? t('已保存 ✓', 'Saved ✓')
                    : t('保存说明', 'Save instructions')}
                </button>
              </div>
            </form>
          ) : (
            <p className="owner-note">
              {originalNote ||
                t(
                  '主人还没有填写说明；不确定时请先联系主人。',
                  'No instructions yet. Contact the owner if unsure.',
                )}
            </p>
          )}
          <div className="section-heading">
            <h3>{t('养护历史', 'Care history')}</h3>
            <span className="muted">
              {history.length} {t('条记录', 'entries')}
            </span>
          </div>
          <CareHistory entries={history} t={t} language={language} />
          <div className="detail-bottom">
            <p className="muted">
              {t('下次检查', 'Next check')}:{' '}
              {formatTime(
                state.reminders[plant.id] || new Date().toISOString(),
                language,
              )}
            </p>
            <button className="button primary" onClick={() => onCare(plant)}>
              <Icon name="drop" />
              {t('检查并记录', 'Check & record')}
            </button>
          </div>
        </>
      )}
      <p className="small-print">
        {t(
          '养护信息为课堂演示内容，请结合植物实际状况判断。',
          'Care information is for this classroom prototype. Consider the actual plant conditions.',
        )}
      </p>
    </Modal>
  )
}
