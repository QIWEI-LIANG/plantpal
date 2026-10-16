import { useEffect, useState } from 'react'
import PageHeading from '../components/PageHeading'
import Icon from '../components/Icon'

export default function IdentifyPage({ t, onNavigate }) {
  const [imageUrl, setImageUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  useEffect(
    () => () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    },
    [imageUrl],
  )
  function chooseImage(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (
      !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError(
        t(
          '请选择 5 MB 以内的 JPG、PNG 或 WebP 图片。',
          'Choose a JPG, PNG or WebP image under 5 MB.',
        ),
      )
      event.target.value = ''
      return
    }
    setError('')
    setFileName(file.name)
    setImageUrl(URL.createObjectURL(file))
  }
  return (
    <>
      <PageHeading
        eyebrow="MEET YOUR NEXT PLANT"
        title={t('查找 / 识别植物', 'Find / identify a plant')}
        description={t(
          '植物识别功能待接入。当前可以本地预览图片，并手动选择品种。',
          'Plant identification is not connected yet. Preview an image locally and choose a species manually.',
        )}
      />
      <p className="notice">
        <Icon name="scan" />
        {t(
          '植物识别功能待接入。图片不会上传，不进行分析，也不会生成识别结果。',
          'Plant identification is not connected yet. Images are not uploaded, analyzed or given identification results.',
        )}
      </p>
      <div className="identify-grid">
        <section className="panel">
          <h2>{t('本地图片预览', 'Local image preview')}</h2>
          <label className="upload-area">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={t(
                  '所选植物图片预览',
                  'Preview of the selected plant image',
                )}
              />
            ) : (
              <>
                <Icon name="upload" size={38} />
                <strong>{t('点击选择图片', 'Choose an image')}</strong>
                <span>JPG / PNG / WebP · 5 MB</span>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={chooseImage}
              aria-label={t('选择本地图片', 'Choose a local image')}
            />
          </label>
          {fileName && <p className="small-print">{fileName}</p>}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="button secondary full-width" disabled>
            {t('植物识别功能待接入', 'Identification not connected yet')}
          </button>
        </section>
        <section className="panel result-panel">
          <div className="result-placeholder">
            <Icon name="book" size={40} />
            <h3>{t('已经知道品种？', 'Know the species already?')}</h3>
            <p>
              {t(
                '搜索品种，阅读指南，并手动添加一盆自己的植物。',
                'Search the species, read its guide and manually add your plant.',
              )}
            </p>
            <button
              className="button primary"
              onClick={() => onNavigate('guides')}
            >
              {t('搜索 / 选择品种', 'Search / choose species')}
            </button>
          </div>
        </section>
      </div>
    </>
  )
}
