import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from '../lib/supabase'
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

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
      return { error: new Error('Supabase is not configured.'), role: null }
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) return { error, role: null }
    const { data: p } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    return { error: null, role: (p?.role ?? null) as UserRole | null }
  }

  async function signUp(email: string, password: string, fullName: string) {
    if (!supabaseConfigured) {
      return { error: new Error('Supabase is not configured.') }
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
