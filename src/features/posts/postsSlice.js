import { createSlice, nanoid } from '@reduxjs/toolkit'

const initialState = [
  { id: '1', title: 'First Post!', content: 'Hello!' },
  { id: '2', title: 'Second Post', content: 'More text' }
]

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postAdded: {
      reducer(state, action) {
        // Since the posts slice _only_ knows about the data it's responsible for,
        // the `state` argument will be the array of posts by itself,
        // and not the entire Redux state object.
        state.push(action.payload)
      },
      prepare(title, content, userId) {
        return {
          payload: {
            id: nanoid(),
            title,
            content,
            // (We'll also update the existing post entries in initialState
            // to have a post.user field with one of the example user IDs.)
            user: userId
          }
        }
      }
    },
    postUpdated(state, action) {
      const { id, title, content } = action.payload
      const existingPost = state.find(post => post.id === id)
      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
      }
    }
  }
})

// When we write the `postAdded` reducer function,
// `createSlice` will automatically generate an "action creator" function
// with the same name.
export const { postAdded, postUpdated } = postsSlice.actions

export default postsSlice.reducer
