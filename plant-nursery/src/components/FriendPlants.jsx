import Modal from './Modal'
import PlantCard from './PlantCard'
import AsyncState from './AsyncState'
import useApiResource from '../hooks/useApiResource'

export default function FriendPlants({
  friend,
  t,
  language,
  onClose,
  onPlant,
}) {
  const resource = useApiResource('/plants/?scope=caretaking', {
    all: true,
    poll: 15000,
  })
  const plants = (resource.data || []).filter(
    (plant) => plant.owner.id === friend.id,
  )
  return (
    <Modal
      title={t(
        friend.nickname + ' 授权的植物',
        'Plants shared by ' + friend.nickname,
      )}
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
      <div className="plant-grid">
        {plants.map((plant) => (
          <PlantCard
            key={plant.id}
            plant={plant}
            t={t}
            language={language}
            onClick={onPlant}
          />
        ))}
      </div>
      {!resource.loading && !resource.error && !plants.length && (
        <p className="empty-state">
          {t(
            '对方尚未授权任何植物给你。好友关系不会自动共享植物资料。',
            'No plants have been shared with you. Friendship does not automatically share plant data.',
          )}
        </p>
      )}
    </Modal>
  )
}
