import React from 'react'

const EventCalendar = ({ events }) => {
  return (
    <ul className="event-list">
      {events.map((event) => (
        <li key={event.id} className="event-item">
          <div className="event-content">
            <p className="event-title">{event.title}</p>
            <p className="event-date">{event.date}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default EventCalendar

