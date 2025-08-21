'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, GraduationCap } from 'lucide-react'

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    college_name: '',
    is_student: true,
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.college_name.trim()) {
      newErrors.college_name = 'College name is required'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      const { confirmPassword, ...registrationData } = formData
      await register(registrationData)
      router.push('/profile-setup')
    } catch (error) {
      // Error is handled in the register function
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card className="border-0 shadow-2xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center">
            Join CollegeHub
          </CardTitle>
          <CardDescription className="text-center text-base">
            Create your account to get started
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name and Email Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-sm font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="signup-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    className="pl-10 h-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    disabled={isLoading}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-destructive font-medium animate-in slide-in-from-left-1">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="signup-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10 h-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive font-medium animate-in slide-in-from-left-1">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* College Name and User Type Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="signup-college" className="text-sm font-medium">
                  College Name
                </Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="signup-college"
                    type="text"
                    value={formData.college_name}
                    onChange={(e) => handleInputChange('college_name', e.target.value)}
                    placeholder="Enter your college name"
                    className="pl-10 h-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    disabled={isLoading}
                  />
                </div>
                {errors.college_name && (
                  <p className="text-xs text-destructive font-medium animate-in slide-in-from-left-1">
                    {errors.college_name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">I am a</Label>
                <RadioGroup
                  value={formData.is_student ? 'student' : 'faculty'}
                  onValueChange={(value) => handleInputChange('is_student', value === 'student')}
                  className="flex gap-4 h-10 items-center"
                  disabled={isLoading}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="student" id="student" />
                    <Label htmlFor="student" className="cursor-pointer text-sm font-medium">
                      Student
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="faculty" id="faculty" />
                    <Label htmlFor="faculty" className="cursor-pointer text-sm font-medium">
                      Faculty
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a password"
                    className="pl-10 pr-10 h-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive font-medium animate-in slide-in-from-left-1">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    className="pl-10 pr-10 h-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive font-medium animate-in slide-in-from-left-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-10 text-sm font-medium mt-6 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}