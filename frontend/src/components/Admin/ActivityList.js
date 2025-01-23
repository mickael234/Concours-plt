import React from 'react'

const ActivityList = ({ activities }) => {
  return (
    <ul className="activity-list">
      {activities.map((activity) => (
        <li key={activity.id} className="activity-item">
          <div className="activity-content">
            <p><strong>{activity.user}</strong> {activity.action}</p>
            <p className="activity-time">{activity.time}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default ActivityList

