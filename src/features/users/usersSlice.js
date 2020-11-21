import { createSlice } from '@reduxjs/toolkit'

import { createAsyncThunk } from '@reduxjs/toolkit'
import { client } from '../../api/client'

import { createEntityAdapter } from '@reduxjs/toolkit'

const usersAdapter = createEntityAdapter()

const initialState = usersAdapter.getInitialState()

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const response = await client.get('/fakeApi/users')
  return response.users
})

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: {
    // The only action we're handling here always replaces
    // the entire list of users
    // with the array we fetched from the server.
    /*
    [fetchUsers.fulfilled]: (state, action) => {
      return action.payload
    }
    */
    [fetchUsers.fulfilled]: usersAdapter.setAll
    // Skip worrying about the loading state for now.
  }
})

/*
export const selectAllUsers = state => state.users

export const selectUserById = (state, userId) =>
  state.users.find(user => user.id === userId)
*/
export const {
  selectAll: selectAllUsers,
  selectById: selectUserById
} = usersAdapter.getSelectors(state => state.users)

export default usersSlice.reducer
