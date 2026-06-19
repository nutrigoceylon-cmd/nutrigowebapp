import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { BrandLogo } from '../../components/layout/BrandLogo'

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>

export function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setServerError('')
    const { error, role } = await signIn(data.email, data.password)
    if (error) {
      setServerError(error.message === 'Supabase is not configured.' ? 'Authentication is unavailable right now.' : 'Invalid email or password. Check your credentials or confirm your email first.')
    } else {
      navigate(role === 'admin' ? '/admin' : '/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200" alt="" className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="relative text-center">
          <div className="flex justify-center mb-8">
            <div className="rounded-3xl bg-white px-5 py-4 shadow-lg">
              <BrandLogo imageClassName="h-14 w-auto" />
            </div>
          </div>
          <h2 className="font-serif text-3xl font-bold text-white mb-4">Welcome Back</h2>
          <p className="text-white/60 text-lg max-w-sm">
            Continue your journey toward better health. Your meals and progress are waiting.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            {[['1,200+', 'Members'], ['50K+', 'Meals Delivered'], ['98%', 'Satisfaction']].map(([num, label]) => (
              <div key={label}>
                <p className="font-bold text-2xl text-white">{num}</p>
                <p className="text-white/50 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <BrandLogo imageClassName="h-12 w-auto" />
          </div>

          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary transition-colors mb-6">
            <ArrowLeft size={15} /> Back to Home
          </Link>

          <h1 className="font-serif text-3xl font-bold text-primary mb-2">Sign In</h1>
          <p className="text-gray-500 text-sm mb-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-gold font-medium hover:text-gold-dark">Create one for free</Link>
          </p>

          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Email Address</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-colors"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <a href="#" className="text-xs text-gold hover:text-gold-dark">Forgot password?</a>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
