import Icon from './Icon'

const navigation = [
  { id: 'home', icon: 'home', zh: '我的花园', en: 'Overview' },
  { id: 'plants', icon: 'plant', zh: '我的植物', en: 'My plants' },
  { id: 'reminders', icon: 'bell', zh: '养护提醒', en: 'Care reminders' },
  { id: 'guides', icon: 'book', zh: '养护指南', en: 'Plant guides' },
  { id: 'identify', icon: 'scan', zh: '查找 / 识别', en: 'Find / identify' },
  { id: 'friends', icon: 'friends', zh: '我的好友', en: 'My friends' },
  { id: 'forum', icon: 'forum', zh: '养护论坛', en: 'Community' },
  { id: 'notifications', icon: 'mail', zh: '站内提醒', en: 'Inbox' },
]

export default function AppLayout({
  children,
  page,
  onNavigate,
  t,
  language,
  onLanguageChange,
  profile,
  dueCount,
  unreadCount,
  view,
  onViewChange,
}) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        {t('跳至主要内容', 'Skip to content')}
      </a>
      <aside className="sidebar">
        <button
          className="brand"
          onClick={() => onNavigate('home')}
          aria-label={t('Plant Pal 首页', 'Plant Pal home')}
        >
          <span className="brand-symbol">
            <Icon name="leaf" size={27} />
          </span>
          <span>
            plant<span className="brand-light">pal</span>
            <small>GROW A LITTLE JOY</small>
          </span>
        </button>
        <p className="nav-label">{t('你的绿色日常', 'YOUR GREEN SPACE')}</p>
        <nav aria-label={t('主导航', 'Main navigation')}>
          {navigation.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
              aria-current={page === item.id ? 'page' : undefined}
            >
              <Icon name={item.icon} />
              <span>{t(item.zh, item.en)}</span>
              {item.id === 'reminders' && dueCount > 0 && (
                <span className="nav-count">{dueCount}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sitter-card">
            <Icon name="shield" size={24} />
            <strong>{t('好好交接，安心出门', 'Good care, even away.')}</strong>
            <p>
              {t(
                '让信任的人，接住你的绿色日常。',
                'Let a trusted friend tend your little jungle.',
              )}
            </p>
            <button
              className="text-button"
              onClick={() => {
                onViewChange(view === 'owner' ? 'caretaker' : 'owner')
                onNavigate('plants')
              }}
            >
              {view === 'owner'
                ? t('查看我代管的植物', 'Plants in my care')
                : t('返回主人视图', 'Back to owner view')}
              <Icon name="arrow" size={16} />
            </button>
          </div>
          <button
            className={`nav-item ${page === 'settings' ? 'active' : ''}`}
            onClick={() => onNavigate('settings')}
            aria-current={page === 'settings' ? 'page' : undefined}
          >
            <Icon name="settings" />
            <span>{t('设置', 'Settings')}</span>
          </button>
          <p className="prototype-label">
            CSI405 · {t('本地演示原型', 'Local prototype')}
          </p>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            Plant Pal <span>/</span>{' '}
            {t(
              navigation.find((item) => item.id === page)?.zh || '设置',
              navigation.find((item) => item.id === page)?.en || 'Settings',
            )}
          </div>
          <div className="topbar-actions">
            <button
              className="view-toggle"
              disabled={!profile}
              onClick={() => {
                onViewChange(view === 'owner' ? 'caretaker' : 'owner')
                onNavigate('plants')
              }}
            >
              {view === 'owner'
                ? t('我代管的', 'In my care')
                : t('我自己的', 'My own plants')}
            </button>
            <div
              className="language-toggle"
              aria-label={t('界面语言', 'Interface language')}
            >
              <button
                aria-pressed={language === 'zh'}
                className={language === 'zh' ? 'selected' : ''}
                onClick={() => onLanguageChange('zh')}
              >
                中
              </button>
              <button
                aria-pressed={language === 'en'}
                className={language === 'en' ? 'selected' : ''}
                onClick={() => onLanguageChange('en')}
              >
                EN
              </button>
            </div>
            <button
              className="icon-button notification-button"
              onClick={() => onNavigate('notifications')}
              aria-label={t('打开站内提醒', 'Open inbox')}
            >
              <Icon name="bell" />
              {unreadCount > 0 && <i />}
            </button>
            <button
              className="profile-button"
              onClick={() => onNavigate('settings')}
            >
              <span className="avatar sage">
                {profile ? profile.nickname.slice(0, 2).toUpperCase() : '?'}
              </span>
              <span>
                <strong>
                  {profile?.nickname || t('登录 / 注册', 'Sign in / Register')}
                </strong>
                <small>
                  {view === 'caretaker'
                    ? t('代管者视图', 'Caretaker view')
                    : t('植物爱好者', 'Plant enthusiast')}
                </small>
              </span>
            </button>
          </div>
        </header>
        <main id="main-content" className="main-content">
          {profile && view === 'caretaker' && (
            <div className="caretaker-banner">
              <Icon name="shield" />
              <span>
                {t(
                  '仅显示明确授权给你的植物。切换视图不会改变登录身份。',
                  'Only plants explicitly shared with you are shown. Your signed-in identity stays the same.',
                )}
              </span>
              <button
                className="text-button"
                onClick={() => onViewChange('owner')}
              >
                {t('返回主人', 'Back to owner')}
              </button>
            </div>
          )}
          {children}
          <footer className="page-footer">
            <span>
              <Icon name="leaf" size={14} />
              {t('陪伴每一片新叶。', 'A little care. A little growth.')}
            </span>
          </footer>
        </main>
      </div>
    </div>
  )
}
