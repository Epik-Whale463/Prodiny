'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { authApi } from '@/lib/api'

export default function VoteButton({ postId, upvotes, downvotes, vertical }: { postId: number, upvotes: number, downvotes: number, vertical?: boolean }) {
  const [up, setUp] = React.useState(upvotes)
  const [down, setDown] = React.useState(downvotes)
  const [loading, setLoading] = React.useState(false)
  const [userVote, setUserVote] = React.useState<number>(0) // -1, 0, 1

  const sendVote = async (vote: number) => {
    setLoading(true)
    try {
      const response = await authApi.votePost(postId, vote)
      // Backend returns updated counts
      if (response.upvotes !== undefined && response.downvotes !== undefined) {
        setUp(response.upvotes)
        setDown(response.downvotes)
        setUserVote(vote)
      }
    } catch (e) {
      console.error('Vote error', e)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = (vote: number) => {
    // If clicking the same vote, remove it (set to 0)
    const newVote = userVote === vote ? 0 : vote
    sendVote(newVote)
  }

  if (vertical) {
    return (
      <div className="flex flex-col items-center">
        <button 
          className={`p-1 transition-all duration-200 ease-in-out button-press ${
            userVote === 1 
              ? 'text-orange-500 scale-110' 
              : 'text-muted-foreground hover:text-orange-500 hover:scale-105'
          }`}
          onClick={() => handleVote(1)} 
          disabled={loading}
          title="Upvote"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414 6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <div className={`text-xs font-medium py-1 min-w-[20px] text-center transition-all duration-200 ${
          up - down > 0 ? 'text-emerald-600 accent-emerald' : 
          up - down < 0 ? 'text-red-500' : 'text-foreground'
        }`}>
          {up - down}
        </div>
        <button 
          className={`p-1 transition-all duration-200 ease-in-out button-press ${
            userVote === -1 
              ? 'text-blue-500 scale-110' 
              : 'text-muted-foreground hover:text-blue-500 hover:scale-105'
          }`}
          onClick={() => handleVote(-1)} 
          disabled={loading}
          title="Downvote"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 15.586l3.293-3.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant={userVote === 1 ? "default" : "ghost"} 
        size="sm" 
        onClick={() => handleVote(1)} 
        disabled={loading}
        className={`button-press ${userVote === 1 ? 'accent-emerald-bg' : ''}`}
      >
        ▲ {up}
      </Button>
      <Button 
        variant={userVote === -1 ? "default" : "ghost"} 
        size="sm" 
        onClick={() => handleVote(-1)} 
        disabled={loading}
        className={`button-press ${userVote === -1 ? 'accent-blue-bg' : ''}`}
      >
        ▼ {down}
      </Button>
    </div>
  )
}
