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
      <article className="post-excerpt" key={post.id}>
        <h3>{post.title}</h3>
        <div>
          <PostAuthor userId={post.user} />
          <TimeAgo timestamp={post.date} />
        </div>
        <p className="post-content">{post.content.substring(0, 100)}</p>
        <Link to={`/posts/${post.id}`} className="button muted-button">
          View Post
        </Link>
        <ReactionButtons post={post} />
      </article>
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
