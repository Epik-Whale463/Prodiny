'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import SignUpForm from './SignUpForm'
import SignInForm from './SignInForm'
import { AuthRedirect } from './AuthRedirect'

export default function AuthContainer() {
  const [showSignIn, setShowSignIn] = useState(false)

  const slideToSignIn = () => {
    setShowSignIn(true)
  }

  const slideToSignUp = () => {
    setShowSignIn(false)
  }

  return (
    <AuthRedirect>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center p-4">
      <div className="auth-container w-full max-w-6xl">
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 overflow-hidden shadow-2xl">
          <div className={`auth-slider ${showSignIn ? 'slide-to-signin' : ''}`}>
            {/* Sign Up Panel */}
            <div className="auth-panel flex flex-col lg:flex-row min-h-[600px]">
              <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
                <SignUpForm />
              </div>
              <div className="flex-1 bg-gradient-to-br from-accent to-accent/80 flex flex-col justify-center items-center p-6 sm:p-8 lg:p-12 text-center">
                <div className="max-w-md space-y-6">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Welcome Back!</h2>
                  <p className="text-muted-foreground text-sm sm:text-base lg:text-lg leading-relaxed">
                    Already have an account? Sign in to access your dashboard and continue your journey
                  </p>
                  <button
                    onClick={slideToSignIn}
                    className="px-6 sm:px-8 py-3 border-2 border-primary/20 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-foreground text-sm sm:text-base font-medium hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>

            {/* Sign In Panel */}
            <div className="auth-panel flex flex-col lg:flex-row min-h-[600px]">
              <div className="flex-1 bg-gradient-to-br from-accent to-accent/80 flex flex-col justify-center items-center p-6 sm:p-8 lg:p-12 text-center">
                <div className="max-w-md space-y-6">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-foreground leading-tight tracking-wide">
                    The best collaboration you'll ever participate in
                  </h2>
                  <div className="w-16 sm:w-20 h-0.5 bg-primary mx-auto"></div>
                  <p className="text-muted-foreground text-sm sm:text-base lg:text-lg font-light italic leading-relaxed">
                    New here? Create an account and start your journey with us today
                  </p>
                  <button
                    onClick={slideToSignUp}
                    className="px-6 sm:px-8 py-3 border-2 border-primary/20 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-foreground text-sm sm:text-base font-medium hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
              <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
                <SignInForm />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
    </AuthRedirect>
  )
}