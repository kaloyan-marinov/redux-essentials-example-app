import { createSlice } from '@reduxjs/toolkit'

const initialState = [
  { id: '1', title: 'First Post!', content: 'Hello!' },
  { id: '2', title: 'Second Post', content: 'More text' }
]

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postAdded(state, action) {
      // Since the posts slice _only_ knows about the data it's responsible for,
      // the `state` argument will be the array of posts by itself,
      // and not the entire Redux state object.
      state.push(action.payload)
    }
  }
})

// When we write the `postAdded` reducer function,
// `createSlice` will automatically generate an "action creator" function
// with the same name.
export const { postAdded } = postsSlice.actions

export default postsSlice.reducer
