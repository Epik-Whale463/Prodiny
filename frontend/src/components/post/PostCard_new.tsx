'use client'

import React from 'react'
import { MessageCircle, Share, MoreHorizontal, Clock, Users } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import VoteButton from './VoteButton'
import CommentList from './CommentList'
import CommentComposer from './CommentComposer'

export default function PostCard({ post }: { post: any }) {
  const [showComments, setShowComments] = React.useState(false)

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{post.author_name}</span>
            <span>·</span>
            <Clock className="h-3 w-3" />
            <span>{formatTimeAgo(post.created_at)}</span>
            {post.subgroup_name && post.subgroup_name !== 'General' && (
              <>
                <span>·</span>
                <Badge variant="secondary" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {post.subgroup_name}
                </Badge>
              </>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Share className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem>Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex gap-4">
          {/* Voting section */}
          <div className="flex-shrink-0">
            <VoteButton postId={post.id} upvotes={post.upvotes} downvotes={post.downvotes} vertical />
          </div>

          {/* Content section */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-lg leading-tight mb-2">{post.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{post.content}</p>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {post.comment_count || 0} comments
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Comments section */}
            {showComments && (
              <div className="space-y-4 pt-4 border-t">
                <CommentComposer postId={post.id} />
                <CommentList postId={post.id} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
