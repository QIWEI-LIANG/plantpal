import { useState } from 'react'
import PlantArt from './PlantArt'

export default function PlantImage({ plant }) {
  const [failedUrl, setFailedUrl] = useState(null)
  if (plant.cover_url && failedUrl !== plant.cover_url) {
    return (
      <img
        className="plant-cover"
        src={plant.cover_url}
        alt={plant.nickname}
        loading="lazy"
        onError={() => setFailedUrl(plant.cover_url)}
      />
    )
  }
  return <PlantArt type={plant.species.type} />
}
