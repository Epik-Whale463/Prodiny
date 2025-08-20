'use client'

import React, { useState } from 'react'
import { authApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function CommentComposer({ postId }: { postId: number }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    try {
      await authApi.createComment({ post_id: postId, content: text })
      setText('')
      // notify listeners to refresh comments
      window.dispatchEvent(new CustomEvent('comment:posted', { detail: { postId } }))
    } catch (err) {
      console.error('Comment failed', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex gap-2 mt-2">
      <Input 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        placeholder="Write a comment..." 
        className="glass-card border-white/30 focus:border-primary/50 interactive-hover"
      />
      <Button 
        type="submit" 
        disabled={loading} 
        className="button-press accent-blue-bg hover:accent-blue-bg"
      >
        {loading ? 'Posting...' : 'Post'}
      </Button>
    </form>
  )
}
