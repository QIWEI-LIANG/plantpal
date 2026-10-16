const languageKey = 'plantpal-language'

export function loadLanguage() {
  try {
    return localStorage.getItem(languageKey) === 'en' ? 'en' : 'zh'
  } catch {
    return 'zh'
  }
}

export function saveLanguage(language) {
  try {
    localStorage.setItem(languageKey, language)
  } catch {
    // 浏览器禁用存储时仍可切换语言，只是不跨页面刷新保存。
  }
}
// 不读取旧 plant-pal-v1：演示植物、身份和历史不导入真实账户。
