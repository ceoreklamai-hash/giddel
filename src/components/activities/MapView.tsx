// src/components/activities/MapView.tsx
import type { Activity } from '@/lib/types'
import { InteractiveMap } from '@/components/map/InteractiveMap'
import styles from './MapView.module.css'

interface Props {
  activities: Activity[]
}

export function MapView({ activities }: Props) {
  return (
    <div className={styles.wrap}>
      <InteractiveMap activities={activities} />
    </div>
  )
}
