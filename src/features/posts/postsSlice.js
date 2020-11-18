import { createSlice, nanoid } from '@reduxjs/toolkit'
import { sub } from 'date-fns'

const initialState = {
  posts: [
    {
      id: '1',
      date: sub(new Date(), { minutes: 10 }).toISOString(),
      title: 'First Post!',
      content: 'Hello!',
      reactions: { thumbsUp: 0, hooray: 0, heart: 0, rocket: 0, eyes: 0 }
    },
    {
      id: '2',
      date: sub(new Date(), { minutes: 5 }).toISOString(),
      title: 'Second Post',
      content: 'More text',
      reactions: { thumbsUp: 0, hooray: 0, heart: 0, rocket: 0, eyes: 0 }
    }
  ],
  status: 'idle',
  error: null
}

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postAdded: {
      reducer(state, action) {
        // Since the posts slice _only_ knows about the data it's responsible for,
        // the `state` argument will be the array of posts by itself,
        // and not the entire Redux state object.
        state.posts.push(action.payload)
      },
      prepare(title, content, userId) {
        return {
          payload: {
            id: nanoid(),
            // Redux actions and state should only contain plain JS values like objects,
            // arrays, and primitives. Don't put class instances, functions, or other
            // non-serializable values into Redux!
            // (So plan to track the post.date as "a timestamp string".)
            date: new Date().toISOString(),
            title,
            content,
            // (We'll also update the existing post entries in initialState
            // to have a post.user field with one of the example user IDs.)
            user: userId,
            reactions: { thumbsUp: 0, hooray: 0, heart: 0, rocket: 0, eyes: 0 }
          }
        }
      }
    },
    postUpdated(state, action) {
      const { id, title, content } = action.payload
      const existingPost = state.posts.find(post => post.id === id)
      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
      }
    },
    reactionAdded(state, action) {
      const { postId, reaction } = action.payload
      const existingPost = state.posts.find(post => post.id === postId)
      if (existingPost) {
        existingPost.reactions[reaction]++
      }
    }
  }
})

// When we write the `postAdded` reducer function,
// `createSlice` will automatically generate an "action creator" function
// with the same name.
export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions

export default postsSlice.reducer

export const selectAllPosts = state => state.posts.posts

export const selectPostById = (state, postId) =>
  state.posts.posts.find(post => post.id === postId)
