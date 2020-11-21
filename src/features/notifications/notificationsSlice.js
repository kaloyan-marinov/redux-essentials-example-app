import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { client } from '../../api/client'

import { createEntityAdapter } from '@reduxjs/toolkit'

const notificationsAdapter = createEntityAdapter({
  sortComparer: (notificationA, notificationB) =>
    notificationB.date.localeCompare(notificationA.date)
})

// The following is
// "an async thunk ... which will retrieve a list of new notifications from the server".
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { getState }) => {
    // In this case, we know that the list of notifications is in our Redux store state
    const allNotifications = selectAllNotifications(getState())
    // Since the array of notifications is sorted newest first,
    // we can grab the latest one using array destructuring.
    const [latestNotification] = allNotifications
    const latestTimestamp = latestNotification ? latestNotification.date : ''
    const response = await client.get(
      `/fakeApi/notifications?since=${latestTimestamp}`
    )
    return response.notifications
  }
)

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: notificationsAdapter.getInitialState(),
  reducers: {
    allNotificationsRead(state, action) {
      // Mark all notifications as read.
      /*
      state.forEach(notification => {
        notification.read = true
      })
      */
      Object.values(state.entities).forEach(notification => {
        notification.read = true
      })
    }
  },
  extraReducers: {
    [fetchNotifications.fulfilled]: (state, action) => {
      // Any notifications we've read are no longer new:
      /*
      state.forEach(notification => {
        notification.isNew = !notification.read
      })
      */
      Object.values(state.entities).forEach(notification => {
        notification.isNew = !notification.read
      })

      /*
      // We know that we will be getting back an array of notifications,
      // so we can pass them as separate arguments to:
      state.push(...action.payload)

      // Sort with newest first
      // make sure that they're sorted ...
      // ... just in case the server were to send them out of order
      state.sort((notificationA, notificationB) =>
        notificationB.date.localeCompare(notificationA.date)
      )
      */
      notificationsAdapter.upsertMany(state, action.payload)
    }
  }
})

export const { allNotificationsRead } = notificationsSlice.actions

export default notificationsSlice.reducer

/*
export const selectAllNotifications = state => state.notifications
*/
export const {
  selectAll: selectAllNotifications
} = notificationsAdapter.getSelectors(state => state.notifications)
