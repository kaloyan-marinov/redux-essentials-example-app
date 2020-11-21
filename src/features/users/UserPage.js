import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { selectUserById } from '../users/usersSlice'

// import { selectAllPosts } from '../posts/postsSlice'
import { selectPostsByUser } from '../posts/postsSlice'

export const UserPage = ({ match }) => {
  const { userId } = match.params

  const user = useSelector(state => selectUserById(state, userId))

  /*
  Our application is looking useful, but we've actually got a couple flaws
  in when and how our components re-render.

  Flaw #1:

  there's a specific problem: ...

  We know that `useSelector` will re-run every time an action is dispatched,
  and that it forces the component to re-render if we return a new reference value.

  We're calling `filter()` inside of our `useSelector` hook,
  so that we only return the list of posts that belong to this user.
  Unfortunately, this means that `useSelector` always returns a new array reference,
  and so our component will re-render after every action
  even if the posts data hasn't changed!

  Fix #1:
  This idea is called "memoization".
  We want to save a previous set of inputs and the calculated result,
  and if the inputs are the same, return the previous result
  instead of recalculating it again.

  Reselect is a library for creating memoized selector functions,
  and was specifically designed to be used with Redux.
  */
  const postsForUser = useSelector(state => selectPostsByUser(state, userId))

  const postTitles = postsForUser.map(post => (
    <li key={post.id}>
      <Link to={`/posts/${post.id}`}>{post.title}</Link>
    </li>
  ))

  return (
    <section>
      <h2>{user.name}</h2>

      <ul>{postTitles}</ul>
    </section>
  )
}
