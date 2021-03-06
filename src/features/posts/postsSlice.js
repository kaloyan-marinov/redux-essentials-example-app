// import { createSlice, nanoid } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { createAsyncThunk } from '@reduxjs/toolkit'
import { client } from '../../api/client'

import { createSelector } from '@reduxjs/toolkit'

/*
Fix #2.3:

The last option is
to find some way to have our reducer keep a separate array of IDs for all the posts,
and only modify that array when posts are added or removed,
and do the same rewrite of `<PostsList>` and `<PostExcerpt>`.

This way, `<PostsList>` only needs to re-render when that IDs array changes.

Conveniently,
Redux Toolkit has a `createEntityAdapter` function that will help us do just that.
*/
import { createEntityAdapter } from '@reduxjs/toolkit'
/*
[The imported function] ... provides a standardized way to store your data in a slice by
taking a collection of items
and putting them into the shape of `{ ids: [], entities: {} }`.
Along with this predefined state shape,
... [the returned adapter object]:

- has a `getInitialState` function that generates an empty `{ ids: [], entities: {} }`
  object. You can pass in more fields to `getInitialState`, and those will be merged in.

- contains a set of generated reducer functions for adding, updating, and removing items
  from an entity state object
  (These reducer functions can
  either be used as a case reducer for a specific action type,
  or as a "mutating" utility function within another reducer in `createSlice`.)

- also has a `getSelectors` function,
  [which accepts as input] a selector that returns a particular slice of state
  from the Redux root state,
  and ... will generate selectors like `selectAll` and `selectById`
*/

// We ... want to keep an array of all post IDs sorted with the newest post first,
// so we pass in a `sortComparer` function
// that will sort newer items to the front based on the `post.date` field.
const postsAdapter = createEntityAdapter({
  sortComparer: (postA, postB) => postB.date.localeCompare(postA.date)
})

const initialState = postsAdapter.getInitialState({
  status: 'idle',
  error: null
})

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
    /*
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
    */
    postUpdated(state, action) {
      const { id, title, content } = action.payload
      const existingPost = state.entities[id]
      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
      }
    },
    reactionAdded(state, action) {
      const { postId, reaction } = action.payload
      const existingPost = state.entities[postId]
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
      // state.posts = state.posts.concat(action.payload)
      // Use the `upsertMany` reducer as a mutating update utility.
      // ... to add all of the incoming posts to the state
      // (If there's any items in `action.payload` that already existing in our state,
      // the `upsertMany` function will merge them together based on matching IDs.)
      postsAdapter.upsertMany(state, action.payload)
    },
    [fetchPosts.rejected]: (state, action) => {
      state.status = 'failed'
      state.error = action.error.message
    },
    /*
    [addNewPost.fulfilled]: (state, action) => {
      // We can directly add the new post object to our posts array.
      state.posts.push(action.payload)
    }
    */
    // Use the `addOne` ... [adapter function as a reducer] directly
    [addNewPost.fulfilled]: postsAdapter.addOne
  }
})

// When we write the `postAdded` reducer function,
// `createSlice` will automatically generate an "action creator" function
// with the same name.
export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions

export default postsSlice.reducer

/*
export const selectAllPosts = state => state.posts.posts

export const selectPostById = (state, postId) =>
  state.posts.posts.find(post => post.id === postId)
*/
// Export the customized selectors for this adapter using `getSelectors`.
// The generated selector functions are always called selectAll and selectById,
// so we can use ES6 destructuring syntax to rename them as we export them
// and match the old selector names.
export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds
  // Pass in a selector that returns the posts slice of state
} = postsAdapter.getSelectors(state => state.posts)

/*
[The] `createSelector` function [from the `Reselect` library] ... generates
memoized selectors that will only recalculate results when the inputs change
- `createSelector` takes one or more "input selector" functions as argument,
  plus an "output selector" function.
- When we call `selectPostsByUser(state, userId)`,
  `createSelector` will pass all of the arguments into each of our input selectors.
- Whatever those input selectors return becomes the arguments for the output selector.
*/
export const selectPostsByUser = createSelector(
  [selectAllPosts, (state, userId) => userId],
  (posts, userId) => posts.filter(post => post.user === userId)
)
