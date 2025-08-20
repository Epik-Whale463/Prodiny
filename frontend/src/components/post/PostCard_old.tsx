'use client'

import React from 'react'
import { MessageCircle, Share } from 'lucide-react'
import VoteButton from './VoteButton'
import CommentList from './CommentList'
import CommentComposer from './CommentComposer'

export default function PostCard({ post }: { post: any }) {
  const [showComments, setShowComments] = React.useState(false)

  return (
    <div className="bg-white hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
      <div className="flex gap-3 p-3">
        {/* Votes column */}
        <div className="flex-shrink-0 pt-1">
          <VoteButton postId={post.id} upvotes={post.upvotes} downvotes={post.downvotes} vertical />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Post metadata */}
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <span className="font-medium text-gray-700">{post.author_name}</span>
            <span>·</span>
            <span>{post.author_college}</span>
            <span>·</span>
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
            {post.subgroup_name && post.subgroup_name !== 'General' && (
              <>
                <span>·</span>
                <span className="text-blue-600">{post.subgroup_name}</span>
              </>
            )}
          </div>

          {/* Post content */}
          <h3 className="font-medium text-gray-900 mb-1 leading-snug">{post.title}</h3>
          <p className="text-gray-700 text-sm mb-2 leading-relaxed">{post.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <button 
              className="flex items-center gap-1 hover:text-gray-700 transition-colors" 
              onClick={() => setShowComments(s => !s)}
            >
              <MessageCircle className="h-3 w-3" />
              {post.comment_count}
            </button>
            <button className="flex items-center gap-1 hover:text-gray-700 transition-colors">
              <Share className="h-3 w-3" />
              Share
            </button>
          </div>

          {/* Comments section */}
          {showComments && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <CommentList postId={post.id} />
              <CommentComposer postId={post.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
