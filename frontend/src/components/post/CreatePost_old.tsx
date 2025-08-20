"use client"

import React, { useEffect, useState } from 'react'
import { authApi } from '@/lib/api'

export default function CreatePost() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [subgroupId, setSubgroupId] = useState<number | null>(null)
  const [postType, setPostType] = useState('discussion')
  const [subgroups, setSubgroups] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    authApi.getSubgroups().then(s => setSubgroups(s)).catch(console.error)
  }, [])

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!title.trim() || !content.trim()) return
    setLoading(true)
    try {
      const post = await authApi.createPost({ title, content, subgroup_id: subgroupId || 0, post_type: postType })
      // notify dashboard to refresh
      window.dispatchEvent(new CustomEvent('post:created', { detail: { post } }))
      setTitle('')
      setContent('')
    } catch (err) {
      console.error('Create post failed', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input 
        placeholder="What's on your mind?" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-0 py-1 text-lg font-medium border-0 focus:outline-none placeholder-gray-400"
      />
      <textarea 
        placeholder="Share your thoughts..." 
        value={content} 
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
        className="w-full px-0 py-1 text-sm border-0 focus:outline-none placeholder-gray-400 resize-none"
        rows={3}
      />
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <select 
            value={postType} 
            onChange={(e) => setPostType(e.target.value)}
            className="text-xs text-gray-600 border-0 focus:outline-none bg-transparent"
            title="Post Type"
          >
            <option value="discussion">Discussion</option>
            <option value="question">Question</option>
            <option value="resource">Resource</option>
          </select>

          <select 
            value={subgroupId || 0} 
            onChange={(e) => setSubgroupId(Number(e.target.value))}
            className="text-xs text-gray-600 border-0 focus:outline-none bg-transparent"
            title="Community"
          >
            <option value={0}>General</option>
            {subgroups.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <button 
          type="submit" 
          disabled={loading || !title.trim() || !content.trim()}
          className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  )
}
