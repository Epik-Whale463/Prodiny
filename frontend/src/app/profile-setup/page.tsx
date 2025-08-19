'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const colleges = [
  "Aditya Institute of Technology and Management",
  "Anil Neerukonda Institute of Technology and Sciences",
  "Annamacharya Institute of Technology and Science",
  "Avanthi Institute of Engineering & Technology",
  "Audisankara College of Engineering & Technology",
  "Bapatla Engineering College",
  "Bonam Venkata Chalamayya Engineering College (Odalarevu)",
  "Chalapathi Institute of Engineering and Technology",
  "Dhanekula Institute of Engineering and Technology",
  "Dvr & Dr Hs Mic College of Technology",
  "Adoni Arts and Science College (Engineering wing)",
  "Gandhi Institute of Technology and Management (GITAM)",
  "Gayatri Vidya Parishad College of Engineering",
  "G Pulla Reddy College of Engineering & Technology",
  "GMR Institute of Technology",
  "Gudlavalleru Engineering College",
  "Krishna University College of Engineering and Technology",
  "KSRM College of Engineering",
  "Lakkireddy Bali Reddy College of Engineering (LBRCE)",
  "Madanapalle Institute of Technology & Science (MITS)",
  "MVGR College of Engineering (MVGRCE) — Vizianagaram",
  "Narasaraopeta Engineering College (NEC)",
  "N.B.K.R. Institute of Science & Technology (NBKRIST)",
  "NRI Institute of Technology — Vijayawada",
  "QIS College of Engineering and Technology (QISE)",
  "Raghu Engineering College",
  "Rajeev Gandhi Memorial College of Engineering & Technology",
  "RVR & JC College of Engineering — Guntur",
  "Sagi Rama Krishnam Raju Engineering College (SRKREC)",
  "Seshadri Rao Gudlavalleru Engineering College (SRGEC)",
  "Shree Institute of Technical Education (SITE)",
  "Sree Vidyanikethan Engineering College",
  "Sri Sivani College of Engineering",
  "Sri Vasavi Engineering College",
  "Sri Venkatesa Perumal College of Engineering & Technology",
  "St. Ann's College of Engineering & Technology",
  "Siddharth Institute of Engineering & Technology",
  "Tenali Engineering College (TECA)",
  "Vasireddy Venkatadri Institute of Technology (VVIT)",
  "Velagapudi Ramakrishna Siddhartha Engineering College (VRSEC)",
  "Vignan's Institute of Information Technology",
  "Vishnu Institute of Technology",
  "Quba College of Engineering and Technology — Nellore (QUBA)"
]

const skillSuggestions = [
  "JavaScript", "Python", "React", "Node.js", "Java", "C++", "Machine Learning",
  "Data Science", "UI/UX Design", "Mobile Development", "DevOps", "Cloud Computing",
  "Artificial Intelligence", "Blockchain", "Cybersecurity", "Web Development",
  "Database Management", "Software Testing", "Project Management", "Git/GitHub"
]

export default function ProfileSetup() {
  const { user, updateUserProfile, loading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    college: '',
    skills: [] as string[],
    githubProfile: ''
  })
  const [currentSkill, setCurrentSkill] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/')
        return
      }

      if (user.profileCompleted) {
        router.push('/dashboard')
        return
      }

      // Set default values from Firebase user
      setFormData({
        fullName: user.displayName || '',
        college: user.college || '',
        skills: user.skills || [],
        githubProfile: user.githubProfile || ''
      })
    }
  }, [user, authLoading, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addSkill = (skill: string) => {
    if (skill.trim() && !formData.skills.includes(skill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }))
      setCurrentSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.college) {
      newErrors.college = 'Please select your college'
    }

    if (formData.skills.length === 0) {
      newErrors.skills = 'Please add at least one skill or interest'
    }

    if (formData.githubProfile && !formData.githubProfile.includes('github.com')) {
      newErrors.githubProfile = 'Please enter a valid GitHub profile URL'
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
      // Update user profile in Firebase
      await updateUserProfile({
        displayName: formData.fullName,
        college: formData.college,
        skills: formData.skills,
        githubProfile: formData.githubProfile || undefined,
        profileCompleted: true
      })
      
      toast.success("Profile setup complete! 🎉", {
        duration: 2000,
        description: "Welcome to CollegeHub!"
      })
      
      // Navigate to dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
      
    } catch (error) {
      console.error('Profile setup failed:', error)
      toast.error("Setup failed", {
        duration: 3000,
        description: "Please try again."
      })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Complete Your Profile</CardTitle>
          <p className="text-muted-foreground mt-2">
            Let's set up your profile to get you connected with your college community
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-base font-semibold">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                className="text-base py-3"
              />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
            </div>

            {/* College */}
            <div className="space-y-2">
              <Label htmlFor="college" className="text-base font-semibold">
                College
              </Label>
              <Select
                value={formData.college}
                onValueChange={(value) => handleInputChange('college', value)}
              >
                <SelectTrigger className="text-base py-3">
                  <SelectValue placeholder="Select your college" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {colleges.map((college) => (
                    <SelectItem key={college} value={college}>
                      {college}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.college && <p className="text-sm text-destructive">{errors.college}</p>}
            </div>

            {/* Skills & Interests */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                Skills & Interests
              </Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    placeholder="Add a skill or interest"
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addSkill(currentSkill)
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => addSkill(currentSkill)}
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                
                {/* Skill suggestions */}
                <div className="flex flex-wrap gap-2">
                  {skillSuggestions.slice(0, 8).map((skill) => (
                    <Button
                      key={skill}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => addSkill(skill)}
                      className="text-xs"
                      disabled={formData.skills.includes(skill)}
                    >
                      + {skill}
                    </Button>
                  ))}
                </div>

                {/* Selected skills */}
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              {errors.skills && <p className="text-sm text-destructive">{errors.skills}</p>}
            </div>

            {/* GitHub Profile */}
            <div className="space-y-2">
              <Label htmlFor="githubProfile" className="text-base font-semibold">
                GitHub Profile (Optional)
              </Label>
              <Input
                id="githubProfile"
                type="url"
                value={formData.githubProfile}
                onChange={(e) => handleInputChange('githubProfile', e.target.value)}
                placeholder="https://github.com/yourusername"
                className="text-base py-3"
              />
              {errors.githubProfile && <p className="text-sm text-destructive">{errors.githubProfile}</p>}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-3 text-base"
              disabled={loading}
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}