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
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg edu-bg-primary">
          <Hash className="h-4 w-4 text-white" />
        </div>
        <h3 className="font-semibold text-lg text-foreground">Create a new post</h3>
      </div>
      
      <form onSubmit={submit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-foreground">Title</Label>
          <Input
            id="title"
            placeholder="What's on your mind?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="focus-highlight transition-all duration-200 border-slate-200 focus:border-primary text-base p-3"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content" className="text-sm font-medium text-foreground">Content</Label>
          <Textarea
            id="content"
            placeholder="Share your thoughts, ask a question, or start a discussion..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="focus-highlight min-h-[120px] resize-none transition-all duration-200 border-slate-200 focus:border-primary text-base p-3"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="community" className="text-sm font-medium text-foreground">Community</Label>
            <Select value={subgroupId} onValueChange={setSubgroupId}>
              <SelectTrigger className="focus-highlight transition-all duration-200 border-slate-200 focus:border-primary">
                <SelectValue placeholder="Select a community" />
              </SelectTrigger>
              <SelectContent className="border-slate-200">
                <SelectItem value="0" className="focus:bg-slate-50">General</SelectItem>
                {subgroups.map((sg) => (
                  <SelectItem key={sg.id} value={sg.id.toString()} className="focus:bg-slate-50">
                    {sg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium text-foreground">Post Type</Label>
            <Select value={postType} onValueChange={setPostType}>
              <SelectTrigger className="focus-highlight transition-all duration-200 border-slate-200 focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-slate-200">
                <SelectItem value="discussion" className="focus:bg-slate-50">Discussion</SelectItem>
                <SelectItem value="question" className="focus:bg-slate-50">Question</SelectItem>
                <SelectItem value="announcement" className="focus:bg-slate-50">Announcement</SelectItem>
                <SelectItem value="project" className="focus:bg-slate-50">Project</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="my-4 bg-slate-200" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <button type="button" disabled className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-muted-foreground bg-transparent border border-transparent rounded-md cursor-not-allowed opacity-50 hover:text-foreground transition-colors">
              <Image className="h-4 w-4 mr-2" />
              Photo
            </button>
            <button type="button" disabled className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-muted-foreground bg-transparent border border-transparent rounded-md cursor-not-allowed opacity-50 hover:text-foreground transition-colors">
              <Link className="h-4 w-4 mr-2" />
              Link
            </button>
          </div>

          <div className="flex items-center space-x-3 md:ml-auto">
            {postType !== 'discussion' && (
              <Badge variant="outline" className="capitalize border-primary/20 text-primary bg-primary/5">
                {postType}
              </Badge>
            )}
            <Button 
              type="submit" 
              disabled={!title.trim() || !content.trim() || loading}
              className="edu-gradient-primary text-white min-w-[120px] px-6 py-2 text-sm font-medium hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
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
