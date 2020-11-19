import { createSlice, nanoid } from '@reduxjs/toolkit'

import { createAsyncThunk } from '@reduxjs/toolkit'
import { client } from '../../api/client'

const initialState = {
  posts: [],
  status: 'idle',
  error: null
}

export const fetchPosts = createAsyncThunk(
  // A string that will be used as the prefix for the generated action types.
  'posts/fetchPosts',
  // A "payload creator" callback function
  // that will usually make an AJAX call to a server API.
  // (It can either return the Promise from the AJAX call directly,
  // or extract some data from the API response and return that.)
  async () => {
    const response = await client.get('/fakeApi/posts')
    return response.posts
  }
)

// We can use `createAsyncThunk` to help with sending data, not just fetching it.
export const addNewPost = createAsyncThunk(
  'posts/addNewPost',
  // The payload creator receives the partial `{title, content, user}` object.
  async initialPost => {
    // We send the initial data to the fake API server.
    const response = await client.post('/fakeApi/posts', { post: initialPost })
    // The response includes the complete post object, including unique ID.
    return response.post
  }
)

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
  },
  // The following field enables its encompassing slice reducer
  // to respond to *other* actions
  // that weren't defined as part of this slice's `reducers` field.
  extraReducers: {
    // The keys are "ES6 object literal computed properties".
    [fetchPosts.pending]: (state, action) => {
      state.status = 'loading'
    },
    [fetchPosts.fulfilled]: (state, action) => {
      state.status = 'succeeded'
      // Add the fetched posts to the array.
      state.posts = state.posts.concat(action.payload)
    },
    [fetchPosts.rejected]: (state, action) => {
      state.status = 'failed'
      state.error = action.error.message
    },
    [addNewPost.fulfilled]: (state, action) => {
      // We can directly add the new post object to our posts array.
      state.posts.push(action.payload)
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
