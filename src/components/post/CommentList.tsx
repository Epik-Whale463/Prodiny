'use client'

import React, { useEffect, useState } from 'react'
import { authApi } from '@/lib/api'
import { Comment } from '@/lib/api'

export default function CommentList({ postId }: { postId: number }) {
  const [comments, setComments] = useState<Comment[]>([])

  useEffect(() => {
    let mounted = true
    const fetch = () => {
      authApi.getPostComments(postId).then((data: Comment[]) => {
        if (mounted) setComments(data)
      }).catch(e => console.error(e))
    }
    fetch()

    const handler = (e: any) => {
      if (e?.detail?.postId === postId) fetch()
    }
    window.addEventListener('comment:posted', handler)

    return () => { mounted = false; window.removeEventListener('comment:posted', handler) }
  }, [postId])

  return (
    <div className="space-y-3">
      {comments.map(c => (
        <div key={c.id} className="p-2 border rounded">
          <div className="text-sm font-medium">{c.author_name}</div>
          <div className="text-sm text-muted-foreground">{new Date(c.created_at).toLocaleString()}</div>
          <div className="mt-1">{c.content}</div>
        </div>
      ))}
    </div>
  )
}
