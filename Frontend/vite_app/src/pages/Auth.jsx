import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Mail, Lock, User, Package, AlertCircle } from 'lucide-react'

const USERS = {
  'prem@gmail.com': { name: 'Prem Kambaliya', email: 'prem@gmail.com' },
  'jatin@gmail.com': { name: 'Jatin', email: 'jatin@gmail.com' },
}
const PASSWORD = '123456'

export default function Auth(){
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [signup, setSignup] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e?.preventDefault?.()
    if (loading) return
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.message || 'Invalid email or password')
      }
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('authUser', JSON.stringify(data.user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const onSignup = async () => {
    if (loading) return
    setError('')
    setLoading(true)
    try {
      const payload = {
        username: signup.name?.trim() || 'User',
        email: signup.email?.trim(),
        password: signup.password
      }
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = data?.message || (data?.errors && data.errors[0]?.msg) || 'Signup failed'
        throw new Error(msg)
      }
      // backend returns token + user on signup
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('authUser', JSON.stringify(data.user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-amber-50/20 to-orange-50/30 p-4 lg:p-8">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-4xl bg-gradient-to-br from-amber-100/20 to-orange-100/20 rounded-full blur-3xl"></div>
      </div>

      {/* Split Layout for Large Screens */}
      <div className="w-full max-w-6xl relative z-10 flex items-center gap-8">
        {/* Left Side - Branding (Hidden on mobile) */}
        <div className="hidden lg:flex flex-1 flex-col justify-center space-y-6 pr-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white grid place-content-center shadow-2xl">
              <Package className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">StockMaster</h1>
              <p className="text-amber-600 font-semibold">Inventory Management</p>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-slate-900 leading-tight">
            Manage Your Inventory<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
              Smarter & Faster
            </span>
          </h2>
          
          <p className="text-slate-600 text-lg leading-relaxed">
            Track stock levels, manage orders, and optimize your warehouse operations all in one powerful platform.
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Real-time Tracking</h3>
                <p className="text-slate-600 text-sm">Monitor inventory levels and movements in real-time</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Smart Analytics</h3>
                <p className="text-slate-600 text-sm">Get insights to make better business decisions</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Easy Collaboration</h3>
                <p className="text-slate-600 text-sm">Work seamlessly with your team</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Card */}
        <Card className="w-full lg:w-[480px] border-0 shadow-2xl overflow-hidden flex-shrink-0">
        {/* Header with Gradient - Simplified for large screens */}
        <CardHeader className="text-center bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 pb-6 pt-6 lg:pb-8 lg:pt-8">
          <div className="flex lg:hidden items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm text-white grid place-content-center shadow-xl border-2 border-white/40">
              <Package className="w-8 h-8" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-white drop-shadow-md">StockMaster</div>
              <div className="text-sm text-white/90 font-medium">Inventory Management</div>
            </div>
          </div>
          <CardTitle className="text-2xl lg:text-3xl text-white font-bold drop-shadow-md">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <p className="text-white/90 text-sm mt-2">
            {mode === 'login' ? 'Sign in to manage your inventory' : 'Get started with StockMaster'}
          </p>
        </CardHeader>

        <CardContent className="pt-6 pb-8 px-8">
          {/* Tab Switcher */}
          <div className="mb-6 grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={()=>{ setMode('login'); setError('') }}
              className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode==='login' 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg transform scale-105' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={()=>{ setMode('signup'); setError('') }}
              className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode==='signup' 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg transform scale-105' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Login Form */}
          {mode==='login' ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-semibold">
                  Email Address
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email} 
                  onChange={(e)=>setEmail(e.target.value)} 
                  required 
                  className="border-slate-300 focus:border-amber-500 focus:ring-amber-500 h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-semibold">
                  Password
                </Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e)=>setPassword(e.target.value)} 
                  required 
                  className="border-slate-300 focus:border-amber-500 focus:ring-amber-500 h-12"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button 
                onClick={onSubmit}
                disabled={loading}
                className={`w-full h-12 text-white font-semibold shadow-lg transition-all duration-200 ${loading ? 'bg-amber-400 cursor-not-allowed' : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 hover:shadow-xl'}`}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin"></span>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </Button>

              {/* Demo Accounts Info */}
              <div className="mt-6 p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                <div className="text-xs font-semibold text-amber-900 mb-2 uppercase tracking-wide">Demo Accounts</div>
                <div className="space-y-1.5 text-sm text-slate-700">
                  <div className="flex items-center gap-2 p-2 bg-white/70 rounded-lg">
                    <User className="w-4 h-4 text-amber-600" />
                    <span className="font-medium">prem@gmail.com</span>
                    <span className="text-slate-500">/ 123456</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white/70 rounded-lg">
                    <User className="w-4 h-4 text-amber-600" />
                    <span className="font-medium">jatin@gmail.com</span>
                    <span className="text-slate-500">/ 123456</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Sign Up Form */
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-semibold">
                  Full Name
                </Label>
                <Input 
                  id="name" 
                  placeholder="Your name" 
                  value={signup.name} 
                  onChange={(e)=>setSignup({...signup, name: e.target.value})} 
                  required
                  className="border-slate-300 focus:border-amber-500 focus:ring-amber-500 h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="s-email" className="text-slate-700 font-semibold">
                  Email Address
                </Label>
                <Input 
                  id="s-email" 
                  type="email" 
                  placeholder="you@example.com" 
                  value={signup.email} 
                  onChange={(e)=>setSignup({...signup, email: e.target.value})} 
                  required
                  className="border-slate-300 focus:border-amber-500 focus:ring-amber-500 h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="s-password" className="text-slate-700 font-semibold">
                  Password
                </Label>
                <Input 
                  id="s-password" 
                  type="password" 
                  placeholder="Create a password (min. 6 characters)" 
                  value={signup.password} 
                  onChange={(e)=>setSignup({...signup, password: e.target.value})} 
                  required
                  className="border-slate-300 focus:border-amber-500 focus:ring-amber-500 h-12"
                />
              </div>

              <Button 
                type="button"
                onClick={onSignup}
                disabled={loading}
                className={`w-full h-12 text-white font-semibold shadow-lg transition-all duration-200 ${loading ? 'bg-amber-400 cursor-not-allowed' : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 hover:shadow-xl'}`}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin"></span>
                    Creating...
                  </span>
                ) : 'Create Account'}
              </Button>

              {/* Info Message */}
              <div className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-700">
                    <span className="font-semibold text-amber-900">New to StockMaster?</span>
                    <br />
                    Create your account to start managing your inventory efficiently.
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <div className="px-6 lg:px-8 pb-6 text-center">
          <p className="text-xs text-slate-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </Card>
      </div>
    </div>
  )
}