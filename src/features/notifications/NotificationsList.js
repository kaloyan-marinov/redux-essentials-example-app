import React from 'react'
import { useSelector } from 'react-redux'
import { formatDistanceToNow, parseISO } from 'date-fns'

import { selectAllUsers } from '../users/usersSlice'

import { selectAllNotifications } from './notificationsSlice'

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import classnames from 'classnames'

import { allNotificationsRead } from './notificationsSlice'

/*
This works, but actually has a slightly surprising bit of behavior. Any time there are
new notifications (either because we've just switched to this tab, or we've fetched some
new notifications from the API), you'll actually see two
"notifications/allNotificationsRead" actions dispatched. Why is that?

Let's say we have fetched some notifications while looking at the <PostsList>, and then
click the "Notifications" tab. The <NotificationsList> component will mount, and the
useEffect callback will run after that first render and dispatch allNotificationsRead.
Our notificationsSlice will handle that by updating the notification entries in the
store. This creates a new state.notifications array containing the immutably-updated
entries, which forces our component to render again because it sees a new array returned
from the useSelector, and the useEffect hook runs again and dispatches
allNotificationsRead a second time. The reducer runs again, but this time no data
changes, so the component doesn't re-render.

There's a couple ways we could potentially avoid that second dispatch, like splitting
the logic to dispatch once when the component mounts, and only dispatch again if the
size of the notifications array changes. But, this isn't actually hurting anything, so
we can leave it alone.

This does actually show that it's possible to dispatch an action and not have any state
changes happen at all. Remember, it's always up to your reducers to decide if any state
actually needs to be updated, and "nothing needs to happen" is a valid decision for a
reducer to make.
*/
export const NotificationsList = () => {
  const dispatch = useDispatch()
  const notifications = useSelector(selectAllNotifications)
  const users = useSelector(selectAllUsers)

  // ... mark ... [all] notifications as read whenever ... [this] component renders,
  // either because we clicked on the tab to view the notifications,
  // or because we already have it open and we just received some additional
  // notifications. We can do this by dispatching `allNotificationsRead` in a
  // `useEffect` hook.
  useEffect(() => {
    dispatch(allNotificationsRead())
  })

  const renderedNotifications = notifications.map(notification => {
    const date = parseISO(notification.date)
    const timeAgo = formatDistanceToNow(date)
    const user = users.find(user => user.id === notification.user) || {
      name: 'Unknown User'
    }

    const notificationClassname = classnames('notification', {
      new: notification.isNew
    })

    return (
      <div key={notification.id} className={notificationClassname}>
        <div>
          <b>{user.name}</b> {notification.message}
        </div>
        <div title={notification.date}>
          <i>{timeAgo} ago</i>
        </div>
      </div>
    )
  })

  return (
    <section className="notificationsList">
      <h2>Notifications</h2>
      {renderedNotifications}
    </section>
  )
}
