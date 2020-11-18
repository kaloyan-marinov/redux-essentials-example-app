import React from 'react'

const reactionEmojis = {
  thumbsUp: '👍',
  hooray: '🎉',
  heart: '♥️',
  rocket: '🚀',
  eyes: '👀'
}

export const ReactionButtons = ({ post }) => {
  const reactionButtons = Object.entries(reactionEmojis).map(
    ([name, emoji]) => {
      return (
        <button
          key={name}
          type="button"
          className="muted-button reaction-button"
        >
          {emoji} {post.reactions[name]}
        </button>
      )
    }
  )

  return <div>{reactionButtons}</div>
}
