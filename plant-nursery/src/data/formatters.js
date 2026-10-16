export function localize(value, language) {
  return typeof value === 'string' ? value : value[language]
}

export function formatTime(value, language) {
  return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function outcomeText(outcome, language) {
  return localize(
    {
      watered: { zh: '已浇水', en: 'Watered' },
      skipped: { zh: '暂不需要', en: 'Not needed' },
      later: { zh: '稍后检查', en: 'Check later' },
    }[outcome],
    language,
  )
}

export function observationText(observation, language) {
  return localize(
    {
      dry: { zh: '土壤偏干', en: 'Soil feels dry' },
      damp: { zh: '土壤仍湿', en: 'Soil is damp' },
      unsure: { zh: '暂不确定，继续观察', en: 'Unsure, keep observing' },
    }[observation] || { zh: '暂不确定', en: 'Unsure' },
    language,
  )
}
