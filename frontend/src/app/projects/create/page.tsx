'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, X, Globe, Eye, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export default function CreateProject() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    visibility: 'public',
    tags: [] as string[]
  })
  const [currentTag, setCurrentTag] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim()) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }))
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required'
    }

    if (!formData.visibility) {
      newErrors.visibility = 'Please select project visibility'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await authApi.createProject({
        title: formData.title,
        description: formData.description,
        visibility: formData.visibility,
        tags: formData.tags
      })
      
      toast.success("Project created successfully! 🎉", {
        duration: 2000,
        description: "Redirecting to your project..."
      })
      
      // Navigate to the new project
      setTimeout(() => {
        router.push(`/projects/${response.project_id}`)
      }, 1500)
      
    } catch (error) {
      console.error('Project creation failed:', error)
      if (error instanceof ApiError) {
        toast.error("Creation failed", {
          duration: 3000,
          description: error.message
        })
      } else {
        toast.error("Creation failed", {
          duration: 3000,
          description: "Please try again."
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4" />
      case 'private': return <Lock className="h-4 w-4" />
      case 'college': return <Eye className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
    }
  }

  const getVisibilityDescription = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'Anyone can view and join this project'
      case 'private': return 'Only invited members can access this project'
      case 'college': return 'Only students from your college can view this project'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground">Create Project</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Project</CardTitle>
            <p className="text-muted-foreground">
              Start a new project and invite collaborators to work together
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                  Project Title
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter your project title"
                  className="text-base py-3"
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              {/* Project Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your project, its goals, and what you're looking to achieve..."
                  className="min-h-32 text-base"
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Project Visibility</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(value) => handleInputChange('visibility', value)}
                >
                  <SelectTrigger className="text-base py-3">
                    <SelectValue placeholder="Select project visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Public</div>
                          <div className="text-xs text-muted-foreground">Anyone can view and join</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="college">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4" />
                        <div>
                          <div className="font-medium">College Only</div>
                          <div className="text-xs text-muted-foreground">Only your college students</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center space-x-2">
                        <Lock className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Private</div>
                          <div className="text-xs text-muted-foreground">Invite only</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {formData.visibility && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    {getVisibilityIcon(formData.visibility)}
                    <span>{getVisibilityDescription(formData.visibility)}</span>
                  </div>
                )}
                {errors.visibility && <p className="text-sm text-destructive">{errors.visibility}</p>}
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Tags (Optional)
                </Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      placeholder="Add a tag (e.g., React, AI, Mobile)"
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTag(currentTag)
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => addTag(currentTag)}
                      variant="outline"
                      disabled={!currentTag.trim() || formData.tags.length >= 10}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Selected tags */}
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    Add tags to help others discover your project ({formData.tags.length}/10)
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}