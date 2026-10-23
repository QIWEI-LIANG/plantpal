import PageHeading from '../components/PageHeading'
import PlantCard from '../components/PlantCard'
import PlantArt from '../components/PlantArt'
import PlantImage from '../components/PlantImage'
import CareHistory from '../components/CareHistory'
import Icon from '../components/Icon'

export default function HomePage({
  t,
  language,
  user,
  summary,
  history,
  myPlants,
  duePlants,
  onNavigate,
  onPlant,
  onCare,
}) {
  const date = new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-GB', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date())
  return (
    <>
      <PageHeading
        eyebrow={date}
        title={t(`你好，${user.nickname} ☀`, `Hello, ${user.nickname} ☀`)}
        description={t(
          '给生活一点绿，也给自己一点慢下来的时间。',
          'A little green in your day. A little room to slow down.',
        )}
        action={
          <button
            className="button secondary"
            onClick={() => onNavigate('guides')}
          >
            <Icon name="plus" />
            {t('添加植物', 'Add a plant')}
          </button>
        }
      />
      <section className="garden-hero">
        <div className="hero-copy">
          <span className="hero-label">
            <span /> YOUR LITTLE GREEN WORLD
          </span>
          <h2>
            {t('照顾植物，', 'Small moments,')}
            <br />
            {t('也是照顾日常。', 'beautiful growth.')}
          </h2>
          <p>
            {t(
              '一片新叶，一次观察。让 Plant Pal 陪你把养护变成轻松的小习惯。',
              'One new leaf, one thoughtful check. Make plant care a simple, happy part of your everyday.',
            )}
          </p>
          <button
            className="button primary"
            onClick={() => onNavigate('reminders')}
          >
            {t('看看今天的养护', 'Today’s care check')}
            <Icon name="arrow" size={18} />
          </button>
        </div>
        <div className="hero-illustration">
          <div className="hero-circle" />
          <span className="hero-spark spark-one">✧</span>
          <span className="hero-spark spark-two">✦</span>
          <PlantArt type="split" className="hero-main-plant" />
          <PlantArt type="sword" className="hero-small-plant" />
          <span className="hero-art-label">
            <Icon name="leaf" size={14} /> GROW AT YOUR OWN PACE
          </span>
        </div>
      </section>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon sage">
            <Icon name="plant" size={23} />
          </span>
          <div>
            <span>{t('我的植物', 'My plants')}</span>
            <strong>
              {myPlants.length}
              <small>{t('株绿色伙伴', 'green companions')}</small>
            </strong>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon peach">
            <Icon name="drop" size={23} />
          </span>
          <div>
            <span>{t('等待检查', 'Ready for a check')}</span>
            <strong>
              {duePlants.length}
              <small>{t('先观察，再决定', 'observe before watering')}</small>
            </strong>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon cream">
            <Icon name="check" size={23} />
          </span>
          <div>
            <span>{t('养护足迹', 'Moments of care')}</span>
            <strong>
              {summary.history}
              <small>{t('条带时间的记录', 'timestamped entries')}</small>
            </strong>
          </div>
        </div>
      </div>
      <div className="home-columns">
        <div>
          <div className="section-heading">
            <div>
              <h2>{t('我的绿色伙伴', 'Your leafy companions')}</h2>
              <p className="muted">
                {t(
                  '每一株，都有自己的生长节奏。',
                  'Each one grows at its own pace.',
                )}
              </p>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate('plants')}
            >
              {t('查看全部', 'View all')}
              <Icon name="arrow" size={16} />
            </button>
          </div>
          {!myPlants.length && (
            <p className="empty-state">
              {t(
                '这里还没有植物。从指南添加第一盆，或等待主人授权代管。',
                'No plants here yet. Add your first plant from a guide, or wait for a care invitation.',
              )}
            </p>
          )}
          <div className="plant-grid home-plant-grid">
            {myPlants.slice(0, 4).map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                t={t}
                language={language}
                onClick={onPlant}
                status={
                  duePlants.some((due) => due.id === plant.id)
                    ? plant.check_status
                    : 'scheduled'
                }
              />
            ))}
          </div>
          <button
            type="button"
            className="discover-banner"
            onClick={() => onNavigate('identify')}
          >
            <div className="discover-icon">
              <Icon name="scan" size={27} />
            </div>
            <div>
              <h3>{t('遇见一株不认识的植物？', 'Meet a new leafy friend?')}</h3>
              <p>
                {t(
                  '识别待接入，现在可以手动选择品种。',
                  'Identification is coming later. Choose a species manually for now.',
                )}
              </p>
            </div>
            <span className="icon-button" aria-hidden="true">
              <Icon name="arrow" />
            </span>
          </button>
        </div>
        <aside className="home-right">
          <section className="panel daily-panel">
            <div className="section-heading">
              <h2>{t('今日小检查', 'A little check-in')}</h2>
              <span className="tag amber">
                {duePlants.length} {t('待检查', 'due')}
              </span>
            </div>
            <p className="muted">
              {t(
                '提醒你观察，不是催你浇水。',
                'A nudge to observe, before you water.',
              )}
            </p>
            {duePlants.length ? (
              duePlants.slice(0, 3).map((plant) => (
                <button
                  className="daily-care-item"
                  key={plant.id}
                  onClick={() => onCare(plant)}
                >
                  <span
                    className="mini-art"
                    style={{ background: plant.species.color }}
                  >
                    <PlantImage plant={plant} />
                  </span>
                  <span>
                    <strong>{plant.nickname}</strong>
                    <small>{t('检查土壤和叶片', 'Check soil & leaves')}</small>
                  </span>
                  <Icon name="arrow" size={18} />
                </button>
              ))
            ) : (
              <div className="all-done">
                <Icon name="check" size={25} />
                <p>
                  {t(
                    '当前检查已完成，慢慢生长吧。',
                    'All caught up. Let them grow.',
                  )}
                </p>
              </div>
            )}
            <button
              className="text-button"
              onClick={() => onNavigate('reminders')}
            >
              {t('查看所有提醒', 'All care reminders')}
              <Icon name="arrow" size={16} />
            </button>
          </section>
          <section className="panel recent-panel">
            <div className="section-heading">
              <h2>{t('最近养护', 'Recent care')}</h2>
              <Icon name="clock" size={18} />
            </div>
            <CareHistory
              entries={history}
              t={t}
              language={language}
              showPlant
            />
          </section>
          <div className="little-note">
            <Icon name="sun" size={24} />
            <p>
              {t(
                '不必每一天都做很多。仔细看一眼，也是一种照顾。',
                'You don’t have to do a lot every day. A thoughtful look is care, too.',
              )}
            </p>
            <span>THE PLANT PAL NOTE</span>
          </div>
        </aside>
      </div>
    </>
  )
}
