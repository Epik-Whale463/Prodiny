"use client"

import React, { useEffect, useState } from 'react'
import { Send, Image, Link, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { authApi } from '@/lib/api'

export default function CreatePost() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [subgroupId, setSubgroupId] = useState<string>('')
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
      const post = await authApi.createPost({ 
        title, 
        content, 
        subgroup_id: subgroupId ? parseInt(subgroupId) : 0, 
        post_type: postType 
      })
      // notify dashboard to refresh
      window.dispatchEvent(new CustomEvent('post:created', { detail: { post } }))
      setTitle('')
      setContent('')
      setSubgroupId('')
    } catch (err) {
      console.error('Create post failed', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Hash className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">Create a new post</h3>
      </div>
      
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="What's on your mind?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            placeholder="Share your thoughts, ask a question, or start a discussion..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="community">Community</Label>
            <Select value={subgroupId} onValueChange={setSubgroupId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a community" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">General</SelectItem>
                {subgroups.map((sg) => (
                  <SelectItem key={sg.id} value={sg.id.toString()}>
                    {sg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Post Type</Label>
            <Select value={postType} onValueChange={setPostType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discussion">Discussion</SelectItem>
                <SelectItem value="question">Question</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="project">Project</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button type="button" variant="ghost" size="sm" disabled>
              <Image className="h-4 w-4 mr-2" />
              Photo
            </Button>
            <Button type="button" variant="ghost" size="sm" disabled>
              <Link className="h-4 w-4 mr-2" />
              Link
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {postType !== 'discussion' && (
              <Badge variant="outline" className="capitalize">
                {postType}
              </Badge>
            )}
            <Button 
              type="submit" 
              disabled={!title.trim() || !content.trim() || loading}
              className="min-w-[100px]"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent mr-2" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Post
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
