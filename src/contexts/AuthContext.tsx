import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile, UserRole } from '../types'

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  role: UserRole | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null; role: UserRole | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Mock profile for development (when Supabase isn't configured)
const DEMO_PROFILE: Profile = {
  id: 'demo-user',
  full_name: 'Demo User',
  role: 'user',
  goal: 'weight_loss',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const DEMO_ADMIN_PROFILE: Profile = {
  id: 'demo-admin',
  full_name: 'Admin User',
  role: 'admin',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const supabaseConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setLoading(true)
        fetchProfile(session.user.id)
      } else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [supabaseConfigured])

  async function fetchProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
    setLoading(false)
  }

  async function signIn(email: string, password: string) {
    if (!supabaseConfigured) {
      const isAdmin = email === 'admin@nutrigo.com'
      const mockUser = { id: isAdmin ? 'demo-admin' : 'demo-user' } as User
      const p = isAdmin ? DEMO_ADMIN_PROFILE : DEMO_PROFILE
      setUser(mockUser)
      setProfile(p)
      return { error: null, role: p.role }
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) return { error, role: null }
    const { data: p } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    return { error: null, role: (p?.role ?? null) as UserRole | null }
  }

  async function signUp(email: string, password: string, fullName: string) {
    if (!supabaseConfigured) {
      const mockUser = { id: 'demo-user' } as User
      setUser(mockUser)
      setProfile({ ...DEMO_PROFILE, full_name: fullName })
      return { error: null }
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    return { error }
  }

  async function signOut() {
    if (!supabaseConfigured) {
      setUser(null)
      setProfile(null)
      return
    }
    await supabase.auth.signOut()
  }

  const role = profile?.role ?? null

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
