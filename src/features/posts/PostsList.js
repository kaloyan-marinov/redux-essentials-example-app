import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { PostAuthor } from './PostAuthor'

import { TimeAgo } from './TimeAgo'

import { ReactionButtons } from './ReactionButtons'

import { selectAllPosts } from './postsSlice'

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchPosts } from './postsSlice'

// let PostExcerpt = ({ post }) => {
const PostExcerpt = ({ post }) => {
  return (
    <article className="post-excerpt" key={post.id}>
      <h3>{post.title}</h3>
      <div>
        <PostAuthor userId={post.user} />
        <TimeAgo timestamp={post.date} />
      </div>
      <p className="post-content">{post.content.substring(0, 100)}</p>

      <ReactionButtons post={post} />
      <Link to={`/posts/${post.id}`} className="button muted-button">
        View Post
      </Link>
    </article>
  )
}

/*
Flaw #2:

If we go back to our <PostsList> and try clicking a reaction button on one of the posts
while capturing a React profiler trace,
we'll see that not only did the <PostsList> and the updated <PostExcerpt> instance
render, all of the <PostExcerpt> components rendered

Why is that?...

React's default behavior is that when a parent component renders,
React will recursively render all child components inside of it!

The immutable update of one post object also created a new `posts` array.
Our <PostsList> had to re-render because the `posts` array was a new reference,
so after it rendered,
React continued downwards and re-rendered all of the <PostExcerpt> components too.

There's a few different ways we could optimize this behavior in <PostsList>.

Fix #2.1:

wrap the <PostExcerpt> component in `React.memo()`, which will ensure that
the component inside of it only re-renders if the props have actually changed.
*/
// PostExcerpt = React.memo(PostExcerpt)

/*
Fix #2.2:

Another option is to rewrite <PostsList> so that it only selects a list of post IDs from
the store instead of the entire posts array, and rewrite <PostExcerpt> so that it
receives a postId prop and calls useSelector to read the post object it needs.
If <PostsList> gets the same list of IDs as before, it won't need to re-render, and so
only our one changed <PostExcerpt> component should have to render.

Unfortunately, this gets tricky because we also need to have all our posts sorted by
date and rendered in the right order. We could update our postsSlice to keep the array
sorted at all times, so we don't have to sort it in the component, and use a memoized
selector to extract just the list of post IDs. We could also customize the comparison
function that useSelector runs to check the results, like
`useSelector(selectPostIds, shallowEqual)`, so that will skip re-rendering if the
contents of the IDs array haven't changed.
*/

export const PostsList = () => {
  const dispatch = useDispatch()
  const posts = useSelector(selectAllPosts)

  const postStatus = useSelector(state => state.posts.status)
  const error = useSelector(state => state.posts.error)

  // Avoid fetching the posts
  // every time the PostsList component renders,
  // or is re-created because we've switched between views.
  // (Otherwise we might end up fetching the posts several times.)
  useEffect(() => {
    if (postStatus === 'idle') {
      dispatch(fetchPosts())
    }
  }, [postStatus, dispatch])

  let content

  if (postStatus === 'loading') {
    return <div className="loader">Loading...</div>
  } else if (postStatus === 'succeeded') {
    const orderedPosts = posts
      .slice()
      .sort((postA, postB) => postB.date.localeCompare(postA.date))

    content = orderedPosts.map(post => (
      <PostExcerpt key={post.id} post={post} />
    ))
  } else if (postStatus === 'failed') {
    content = <div>{error}</div>
  }

  return (
    <section className="posts-list">
      <h2>Posts</h2>
      {content}
    </section>
  )
}
