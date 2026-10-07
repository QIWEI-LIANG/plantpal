import { useEffect, useState } from 'react'
import PageHeading from '../components/PageHeading'
import PlantArt from '../components/PlantArt'
import Icon from '../components/Icon'
import { plantData } from '../data/plantData'
import { localize } from '../data/formatters'

export default function IdentifyPage({
  t,
  language,
  state,
  view,
  onAdd,
  onPlant,
}) {
  const [selectedId, setSelectedId] = useState('monstera')
  const [imageUrl, setImageUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const selected = plantData.find((plant) => plant.id === selectedId)

  useEffect(() => {
    // 释放本地预览地址；图片只存在于浏览器内存，不上传，也不保存到 localStorage。
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    }
  }, [imageUrl])

  function upload(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (
      !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError(
        t(
          '请选择 5 MB 以内的 JPG、PNG 或 WebP 图片。',
          'Choose a JPG, PNG, or WebP image under 5 MB.',
        ),
      )
      event.target.value = ''
      return
    }
    setError('')
    setResult(null)
    setFileName(file.name)
    setImageUrl(URL.createObjectURL(file))
  }

  return (
    <>
      <PageHeading
        eyebrow="MEET YOUR NEXT PLANT"
        title={t('查找 / 识别植物', 'Find / identify a plant')}
        description={t(
          '从一张照片开始，体验发现和添加植物的流程。',
          'Start with a photo. Explore how finding and adding a plant could work.',
        )}
      />
      <p className="notice">
        <Icon name="scan" />
        <span>
          {t(
            '模拟功能：没有 AI 分析或上传。结果来自你下方选择的示例植物，与上传图片内容无关。',
            'Simulation: no AI analysis or upload. The result comes from the example plant you select below, regardless of the uploaded image.',
          )}
        </span>
      </p>
      <div className="identify-grid">
        <section className="panel">
          <h2>{t('1. 选择一张图片', '1. Choose an image')}</h2>
          <label className="upload-area">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={t('你选择的图片预览', 'Preview of your selected image')}
              />
            ) : (
              <>
                <Icon name="upload" size={38} />
                <strong>{t('点击选择本地图片', 'Choose a local photo')}</strong>
                <span>JPG / PNG / WebP · {t('最大 5 MB', 'up to 5 MB')}</span>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={upload}
              aria-label={t(
                '上传植物图片，仅本地预览',
                'Choose plant image for local preview',
              )}
            />
          </label>
          {fileName && (
            <p className="small-print">
              {fileName} · {t('仅本地预览', 'local preview only')}
            </p>
          )}
          <h3>
            {t(
              '或者，选择一张示例植物插画',
              'Or choose an example illustration',
            )}
          </h3>
          <div className="example-choices">
            {plantData.slice(0, 3).map((plant) => (
              <button
                key={plant.id}
                className={selectedId === plant.id ? 'selected' : ''}
                aria-pressed={selectedId === plant.id}
                onClick={() => {
                  setSelectedId(plant.id)
                  setResult(null)
                  setImageUrl('')
                  setFileName('')
                }}
              >
                <PlantArt type={plant.type} />
                <span>{localize(plant.name, language)}</span>
              </button>
            ))}
          </div>
          <label className="field-label" htmlFor="demo-result">
            {t(
              '演示结果（由你选择，不分析图片）',
              'Demo result (your choice, no image analysis)',
            )}
          </label>
          <select
            id="demo-result"
            value={selectedId}
            onChange={(event) => {
              setSelectedId(event.target.value)
              setResult(null)
            }}
          >
            {plantData.map((plant) => (
              <option value={plant.id} key={plant.id}>
                {localize(plant.name, language)}
              </option>
            ))}
          </select>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="button primary full-width identify-submit"
            onClick={() => setResult(selected)}
          >
            <Icon name="scan" />
            {t('展示示例识别结果', 'Show example result')}
          </button>
        </section>
        <section className="panel result-panel">
          <h2>{t('2. 确认示例结果', '2. Confirm the example')}</h2>
          {result ? (
            <div className="identification-result" role="status">
              <span className="tag">
                {t('示例识别结果 · 预设数据', 'Example result · preset data')}
              </span>
              <div className="result-art" style={{ background: result.color }}>
                <PlantArt type={result.type} />
              </div>
              <h2>{localize(result.name, language)}</h2>
              <p className="scientific">{result.scientific}</p>
              <p>{localize(result.water, language)}</p>
              <button
                className="button primary full-width"
                onClick={() => onAdd(result)}
                disabled={
                  view === 'caretaker' || state.plantIds.includes(result.id)
                }
              >
                {state.plantIds.includes(result.id)
                  ? t('已在我的植物中 ✓', 'Already in my plants ✓')
                  : view === 'caretaker'
                    ? t('请切换为主人添加', 'Switch to owner to add')
                    : t('确认并加入我的植物', 'Confirm & add to my plants')}
              </button>
              <button className="text-button" onClick={() => onPlant(result)}>
                {t('查看养护指南', 'View care guide')}
                <Icon name="arrow" size={16} />
              </button>
            </div>
          ) : (
            <div className="result-placeholder">
              <Icon name="leaf" size={48} />
              <h3>
                {t(
                  '你的绿色发现，将出现在这里',
                  'Your green discovery goes here',
                )}
              </h3>
              <p>
                {t(
                  '选择示例或本地图片，再点击“展示示例识别结果”。',
                  'Choose an example or local image, then show the example result.',
                )}
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
