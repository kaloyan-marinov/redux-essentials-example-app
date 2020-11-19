import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// import { postAdded } from './postsSlice'

import { unwrapResult } from '@reduxjs/toolkit'
import { addNewPost } from './postsSlice'

export const AddPostForm = () => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [userId, setUserId] = useState('')
  // - We _could_ track the request status in postsSlice using a second "loading" enum,
  //   but for this example let's keep the loading state limited to the component.
  // - We _can_ add a "loading" status enum field as a React `useState` hook,
  //   similar to how we're tracking loading state in `postsSlice` for fetching posts.
  //   In this case, we just want to know if the request is in progress or not.
  // To wit:
  const [addRequestStatus, setAddRequestStatus] = useState('idle')

  const dispatch = useDispatch()

  const users = useSelector(state => state.users)

  const onTitleChanged = e => setTitle(e.target.value)
  const onContentChanged = e => setContent(e.target.value)
  const onAuthorChanged = e => setUserId(e.target.value)

  // ... add a bit of validation logic to our form so that
  // the user can only click the "Save Post" button
  // if the title and content inputs some actual text in them
  // and
  // disable the "Save Post" button while we're waiting for the request
  // (so the user can't accidentally try to save a post twice):
  const canSave =
    [title, content, userId].every(Boolean) && addRequestStatus === 'idle'

  const onSavePostClicked = async () => {
    if (canSave) {
      try {
        setAddRequestStatus('pending')
        const resultAction = await dispatch(
          addNewPost({ title, content, user: userId })
        )

        // `createAsyncThunk`:
        // - handles any errors internally
        // - returns the final action it dispatched:
        //   either the `fulfilled` action if it succeeded,
        //   or the `rejected` action if it failed.
        //
        // Redux Toolkit has a utility function called `unwrapResult` that will
        // either return the actual `action.payload` value from a `fulfilled` action,
        // or throw an error if it's the `rejected` action.
        // (This lets us handle success and failure in the component
        // using normal `try/catch` logic.)
        unwrapResult(resultAction)

        //
        setTitle('')
        setContent('')
        setUserId('')
      } catch (err) {
        // If you want to see what happens when the `addNewPost` API call fails,
        // [you can] try creating a new post where the "Content" field only has the word
        // "error" (without quotes). The server will see that and send back a failed
        // response, so you should see a message logged to the console.
        console.error('Failed to save the post: ', err)
      } finally {
        setAddRequestStatus('idle')
      }
    }
  }

  const usersOptions = users.map(user => (
    <option key={user.id} value={user.id}>
      {user.name}
    </option>
  ))

  return (
    <section>
      <h2>Add a New Post</h2>
      <form>
        <label htmlFor="postTitle">Post Title:</label>
        <input
          type="text"
          id="postTitle"
          name="postTitle"
          value={title}
          onChange={onTitleChanged}
        />
        <label htmlFor="postAuthor">Author:</label>
        <select id="postAuthor" value={userId} onChange={onAuthorChanged}>
          <option value=""></option>
          {usersOptions}
        </select>
        <label htmlFor="postContent">Content:</label>
        <textarea
          id="postContent"
          name="postContent"
          value={content}
          onChange={onContentChanged}
        />
        <button type="button" onClick={onSavePostClicked} disabled={!canSave}>
          Save Post
        </button>
      </form>
    </section>
  )
}
