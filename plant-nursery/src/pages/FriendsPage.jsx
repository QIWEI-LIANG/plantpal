import { useState } from 'react'
import PageHeading from '../components/PageHeading'
import SearchField from '../components/SearchField'
import Modal from '../components/Modal'
import PlantArt from '../components/PlantArt'
import Icon from '../components/Icon'
import { friendData } from '../data/communityData'
import { plantData } from '../data/plantData'
import { localize } from '../data/formatters'

export default function FriendsPage({ t, language, state, onUpdate, notify }) {
  const [query, setQuery] = useState('')
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [reminderFeedback, setReminderFeedback] = useState('')
  const friends = friendData.filter((friend) =>
    `${friend.name} ${friend.bio.zh} ${friend.bio.en}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  )
  function addFriend(friend) {
    onUpdate((previous) => ({
      ...previous,
      friendIds: [...previous.friendIds, friend.id],
    }))
    notify(
      t(
        `已添加示例好友 ${friend.name}，仅保存在本机。`,
        `Example friend ${friend.name} added on this device.`,
      ),
    )
  }
  return (
    <>
      <PageHeading
        eyebrow="GROW TOGETHER"
        title={t('我的好友', 'My friends')}
        description={t(
          '分享绿色日常，也为朋友的植物多留一点心。',
          'Share the green moments. Look out for your friends’ plants.',
        )}
      />
      <div className="toolbar">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder={t(
            '搜索好友，例如 Mia / Alex / Sam…',
            'Search friends, e.g. Mia / Alex / Sam…',
          )}
        />
        <span className="tag">
          {t('示例好友目录', 'Example friend directory')}
        </span>
      </div>
      <p className="small-print">
        {t(
          '好友和植物状态均为内置示例；添加好友不创建真实关系。',
          'Friends and plant statuses are preset examples. Adding a friend creates no real connection.',
        )}
      </p>
      <div className="friend-grid">
        {friends.map((friend) => {
          const connected = state.friendIds.includes(friend.id)
          return (
            <article className="panel friend-card" key={friend.id}>
              <span className={`avatar large ${friend.color}`}>
                {friend.initials}
              </span>
              <span className="tag">
                {connected
                  ? t('我的好友', 'Connected')
                  : t('可以添加', 'Discover')}
              </span>
              <h2>{friend.name}</h2>
              <p className="muted">{localize(friend.bio, language)}</p>
              <div className="friend-plants">
                {friend.plants.map((item) => (
                  <span key={item.plantId}>
                    <Icon name="plant" size={16} />
                    {localize(
                      plantData.find((plant) => plant.id === item.plantId).name,
                      language,
                    )}
                  </span>
                ))}
              </div>
              <button
                className={`button ${connected ? 'secondary' : 'primary'} full-width`}
                onClick={() => {
                  if (connected) {
                    setSelectedFriend(friend)
                    setReminderFeedback('')
                  } else {
                    addFriend(friend)
                  }
                }}
              >
                <Icon name={connected ? 'plant' : 'plus'} />
                {connected
                  ? t('查看植物状态', 'View plant status')
                  : t('添加示例好友', 'Add example friend')}
              </button>
            </article>
          )
        })}
      </div>
      {!friends.length && (
        <div className="empty-state">
          <h3>{t('没有找到示例好友', 'No example friends found')}</h3>
          <p>{t('可以搜索 Mia、Alex 或 Sam。', 'Try Mia, Alex, or Sam.')}</p>
        </div>
      )}
      {selectedFriend && (
        <Modal
          title={t(
            `${selectedFriend.name} 的植物`,
            `${selectedFriend.name}’s plants`,
          )}
          t={t}
          onClose={() => setSelectedFriend(null)}
        >
          <p className="notice">
            {t(
              '以下为示例状态，提醒只展示本地模拟反馈，不会发送给任何人。',
              'Example statuses only. Reminders show local feedback and are not sent to anyone.',
            )}
          </p>
          {selectedFriend.plants.map((item) => {
            const plant = plantData.find((entry) => entry.id === item.plantId)
            return (
              <div className="friend-plant-row" key={item.plantId}>
                <span className="mini-art" style={{ background: plant.color }}>
                  <PlantArt type={plant.type} />
                </span>
                <div>
                  <h3>{localize(plant.name, language)}</h3>
                  <span
                    className={`tag ${item.status === 'check' ? 'amber' : ''}`}
                  >
                    {item.status === 'check'
                      ? t('示例 · 待检查', 'Example · check due')
                      : t('示例 · 最近已检查', 'Example · recently checked')}
                  </span>
                </div>
                <button
                  className="button secondary"
                  onClick={() =>
                    setReminderFeedback(
                      t(
                        `模拟提醒：已为 ${selectedFriend.name} 生成“请检查${plant.name.zh}”的本地反馈，未发送真实消息。`,
                        `Demo reminder for ${selectedFriend.name}: “Please check ${plant.name.en}”. No message was sent.`,
                      ),
                    )
                  }
                >
                  <Icon name="bell" size={16} />
                  {t('发送提醒（模拟）', 'Remind (demo)')}
                </button>
              </div>
            )
          })}
          {reminderFeedback && (
            <p className="notice" role="status">
              {reminderFeedback}
            </p>
          )}
        </Modal>
      )}
    </>
  )
}
