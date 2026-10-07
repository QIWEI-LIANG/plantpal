import { useState } from 'react'
import Modal from './Modal'
import Icon from './Icon'
import { localize } from '../data/formatters'

export default function CareReminder({
  plant,
  t,
  language,
  onClose,
  onRecord,
}) {
  const [observation, setObservation] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')
  function record(outcome) {
    // 必须先选择观察结果并确认已检查，才允许生成带时间的养护记录。
    if (!observation || !confirmed) {
      setError(
        t(
          '请先选择观察结果，并确认已检查植物。',
          'Choose an observation and confirm you checked the plant first.',
        ),
      )
      return
    }
    if (outcome === 'watered' && observation !== 'dry') {
      setError(
        t(
          '当前观察不支持直接浇水。请选“暂不需要”或“稍后检查”，或重新检查土壤。',
          'This observation does not support watering yet. Choose “Not needed” or “Check later”, or recheck the soil.',
        ),
      )
      return
    }
    onRecord(plant, outcome, observation)
  }
  return (
    <Modal
      title={t('先检查，再决定', 'Check first. Then decide.')}
      t={t}
      onClose={onClose}
    >
      <p className="eyebrow">
        {localize(plant.name, language)} · {plant.scientific}
      </p>
      <div className="check-prompt">
        <span className="round-icon">
          <Icon name="leaf" size={26} />
        </span>
        <h3>{t('现在的植物，是什么状态？', 'How is your plant doing?')}</h3>
        <p>{localize(plant.check, language)}</p>
      </div>
      <fieldset className="observation-options">
        <legend>{t('你的观察', 'Your observation')}</legend>
        {[
          ['dry', '土壤偏干', 'Soil feels dry'],
          ['damp', '土壤仍湿', 'Soil is damp'],
          ['unsure', '暂不确定', 'Not sure yet'],
        ].map(([value, zh, en]) => (
          <label
            key={value}
            className={observation === value ? 'selected' : ''}
          >
            <input
              type="radio"
              name="observation"
              value={value}
              checked={observation === value}
              onChange={() => {
                setObservation(value)
                setError('')
              }}
            />
            {t(zh, en)}
          </label>
        ))}
      </fieldset>
      <label className="confirmation">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => {
            setConfirmed(event.target.checked)
            setError('')
          }}
        />
        {t(
          '我已实际检查土壤或叶片，不是仅凭提醒决定浇水。',
          'I checked the soil or leaves, rather than watering just because of a reminder.',
        )}
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="care-actions">
        <button className="button primary" onClick={() => record('watered')}>
          <Icon name="drop" />
          {t('已浇水', 'Watered')}
        </button>
        <button className="button secondary" onClick={() => record('skipped')}>
          <Icon name="check" />
          {t('暂不需要', 'Not needed')}
        </button>
        <button className="button secondary" onClick={() => record('later')}>
          <Icon name="clock" />
          {t('稍后检查', 'Check later')}
        </button>
      </div>
      <p className="small-print">
        {t(
          '“稍后检查”会延后 2 小时；其他选择安排明天再检查。仅在网页内显示提醒，没有后台通知。',
          '“Check later” postpones the check by 2 hours; other choices schedule tomorrow. Reminders appear in this webpage only; no background notifications.',
        )}
      </p>
    </Modal>
  )
}
