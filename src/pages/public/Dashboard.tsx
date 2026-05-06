import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Droplets, Dumbbell, Plus, Flame, Apple, Calendar, Video, Clock } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import type { SessionBooking } from '../../types'
import { mockNutritionLogs, mockWeightLogs, mockWorkoutLogs, mockSubscriptions, mockMeals } from '../../data/mockData'
import { MacroDonut } from '../../components/charts/MacroDonut'
import { ProgressChart } from '../../components/charts/ProgressChart'
import { NutritionChart } from '../../components/charts/NutritionChart'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/Badge'
import { formatDate } from '../../lib/helpers'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function Dashboard() {
  const { profile, user } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'nutrition' | 'weight' | 'workout' | 'sessions'>('overview')
  const [sessionBookings, setSessionBookings] = useState<SessionBooking[]>([])

  useEffect(() => {
    if (!user) return
    supabase.from('session_bookings')
      .select('*, provider:providers(name, title, specialty)')
      .eq('user_id', user.id)
      .order('booking_date', { ascending: false })
      .then(({ data }) => setSessionBookings(data ?? []))
  }, [user])

  const todayLogs = mockNutritionLogs.filter(l => l.log_date === '2024-04-26')
  const todayCalories = todayLogs.reduce((s, l) => s + l.calories, 0)
  const todayProtein = todayLogs.reduce((s, l) => s + l.protein, 0)
  const todayCarbs = todayLogs.reduce((s, l) => s + l.carbs, 0)
  const todayFat = todayLogs.reduce((s, l) => s + l.fat, 0)
  const todayWater = todayLogs.reduce((s, l) => s + (l.water_ml ?? 0), 0)

  const subscription = mockSubscriptions[0]
  const todayMeals = mockMeals.filter(m => m.day_of_week === 1)

  const nutritionChartData = [
    { date: 'Mon', calories: 1380, protein: 80, carbs: 105, fat: 42 },
    { date: 'Tue', calories: 1520, protein: 85, carbs: 120, fat: 48 },
    { date: 'Wed', calories: 1450, protein: 105, carbs: 110, fat: 56 },
    { date: 'Thu', calories: 1380, protein: 78, carbs: 95, fat: 44 },
    { date: 'Fri', calories: 1480, protein: 88, carbs: 115, fat: 52 },
    { date: 'Sat', calories: 1600, protein: 75, carbs: 135, fat: 58 },
    { date: 'Sun', calories: 1380, protein: 105, carbs: 70, fat: 56 },
  ]

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'nutrition', label: 'Nutrition Log' },
    { key: 'weight', label: 'Weight' },
    { key: 'workout', label: 'Workout' },
    { key: 'sessions', label: 'My Sessions' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-primary">
          Good morning, {profile?.full_name?.split(' ')[0] ?? 'there'}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's your health snapshot for today.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-light-olive/40 p-1 rounded-xl mb-8 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer flex-1 ${
              activeTab === tab.key ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Today's Calories", value: `${todayCalories}`, unit: '/ 1,500 kcal', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
              { label: 'Protein', value: `${todayProtein}g`, unit: '/ 120g target', icon: Apple, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Water', value: `${(todayWater / 1000).toFixed(1)}L`, unit: '/ 2.5L target', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Workouts', value: '3', unit: 'this week', icon: Dumbbell, color: 'text-gold', bg: 'bg-gold/10' },
            ].map(stat => (
              <Card key={stat.label} padding="md">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.bg}`}>
                  <stat.icon size={20} className={stat.color} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.unit}</p>
                <p className="text-xs font-medium text-gray-600 mt-1">{stat.label}</p>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Subscription */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">My Subscription</h3>
                <StatusBadge status={subscription?.status ?? 'active'} />
              </div>
              {subscription ? (
                <>
                  <p className="font-serif font-bold text-primary text-lg mb-1">{subscription.meal_plan?.name}</p>
                  <p className="text-gray-400 text-sm mb-4">{subscription.meal_plan?.calories_per_day} cal/day · {subscription.delivery_time_slot}</p>
                  <p className="text-xs text-gray-400">Until {formatDate(subscription.end_date)}</p>
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">Pause</button>
                    <button className="flex-1 py-2 border border-red-200 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer">Cancel</button>
                  </div>
                </>
              ) : (
                <Link to="/menu" className="block text-center py-3 bg-gold text-white rounded-xl text-sm font-medium">
                  Subscribe to a Plan
                </Link>
              )}
            </Card>

            {/* Today's Meals */}
            <Card className="lg:col-span-2">
              <h3 className="font-semibold text-gray-900 mb-4">Today's Meal Schedule</h3>
              <div className="space-y-3">
                {todayMeals.map(meal => (
                  <div key={meal.id} className="flex items-center gap-4 p-3 bg-light-olive/30 rounded-xl">
                    <img src={meal.image_url} alt={meal.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{meal.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{meal.meal_type} · {meal.prep_time} min prep</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-primary text-sm">{meal.calories}</p>
                      <p className="text-xs text-gray-400">cal</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Weekly Schedule */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Weekly Meal Schedule</h3>
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, i) => {
                const isToday = i === 0
                return (
                  <div
                    key={day}
                    className={`rounded-xl p-3 text-center border transition-colors ${isToday ? 'bg-primary border-primary text-white' : 'border-gray-100 hover:border-sage'}`}
                  >
                    <p className={`text-xs font-semibold mb-2 ${isToday ? 'text-white/70' : 'text-gray-400'}`}>{day}</p>
                    <div className="space-y-1">
                      {['B', 'L', 'D'].map(type => (
                        <div
                          key={type}
                          className={`w-full h-1.5 rounded-full ${isToday ? 'bg-gold' : 'bg-sage/50'}`}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Nutrition Log Tab */}
      {activeTab === 'nutrition' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Today's Nutrition</h3>
                <Button size="sm" variant="outline">
                  <Plus size={14} /> Log Meal
                </Button>
              </div>
              <div className="space-y-3 mb-6">
                {todayLogs.map(log => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{log.food_name}</p>
                      <p className="text-xs text-gray-400 capitalize">{log.meal_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary text-sm">{log.calories} cal</p>
                      <p className="text-xs text-gray-400">{log.protein}P · {log.carbs}C · {log.fat}F</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 flex justify-between text-sm">
                <span className="text-gray-500">Total Today</span>
                <span className="font-bold text-primary">{todayCalories} cal · {todayProtein}g P · {todayCarbs}g C · {todayFat}g F</span>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Macro Breakdown</h3>
              <MacroDonut protein={todayProtein} carbs={todayCarbs} fat={todayFat} />
            </Card>
          </div>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">7-Day Macros</h3>
            <NutritionChart data={nutritionChartData} />
          </Card>
        </div>
      )}

      {/* Weight Tab */}
      {activeTab === 'weight' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Current Weight', value: '76.8 kg', delta: '-1.7 kg' },
              { label: 'Start Weight', value: '78.5 kg', delta: '' },
              { label: 'Goal Weight', value: '70 kg', delta: '−6.8 kg to go' },
            ].map(stat => (
              <Card key={stat.label}>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                {stat.delta && <p className="text-xs text-green-600 font-medium mt-1">{stat.delta}</p>}
              </Card>
            ))}
          </div>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Weight Progress</h3>
              <Button size="sm" variant="outline"><Plus size={14} /> Log Weight</Button>
            </div>
            <ProgressChart data={mockWeightLogs} />
          </Card>
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Weight Log History</h3>
            <div className="space-y-2">
              {mockWeightLogs.slice().reverse().map(log => (
                <div key={log.id} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600">{formatDate(log.log_date)}</span>
                  <div className="text-right">
                    <span className="font-semibold text-primary text-sm">{log.weight} kg</span>
                    {log.body_fat_percentage && <span className="text-xs text-gray-400 ml-3">{log.body_fat_percentage}% BF</span>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">My Session Bookings</h2>
            <Link to="/sessions" className="text-sm font-medium text-primary hover:text-secondary transition-colors">
              Book a Session →
            </Link>
          </div>
          {sessionBookings.length === 0 ? (
            <Card>
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-light-olive flex items-center justify-center mx-auto mb-4">
                  <Calendar size={28} className="text-primary" />
                </div>
                <p className="font-semibold text-gray-800 mb-1">No sessions booked yet</p>
                <p className="text-sm text-gray-400 mb-5">Connect with our certified nutritionists, dietitians and wellness coaches.</p>
                <Link to="/sessions" className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-secondary transition-colors">
                  Browse Providers
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {sessionBookings.map(booking => {
                const provider = (booking as any).provider
                const statusColors: Record<string, string> = {
                  pending: 'bg-yellow-50 border-yellow-200',
                  confirmed: 'bg-green-50 border-green-200',
                  cancelled: 'bg-red-50 border-red-100',
                  completed: 'bg-gray-50 border-gray-200',
                }
                return (
                  <div key={booking.id} className={`rounded-2xl border p-5 flex items-center gap-5 ${statusColors[booking.status] ?? 'bg-white border-gray-100'}`}>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{provider?.name ?? 'Provider'}</p>
                      <p className="text-xs text-gray-400 capitalize mb-1">{provider?.specialty?.replace(/_/g, ' ')} · {booking.session_type}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Clock size={11} /> {formatDate(booking.booking_date)} at {booking.start_time}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <StatusBadge status={booking.status} />
                      {booking.meeting_link && booking.status === 'confirmed' && (
                        <a href={booking.meeting_link} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline">
                          <Video size={12} /> Join Meeting
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Workout Tab */}
      {activeTab === 'workout' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Workouts This Week', value: '3' },
              { label: 'Total Minutes', value: '130' },
              { label: 'Calories Burned', value: '1,080' },
            ].map(stat => (
              <Card key={stat.label}>
                <p className="text-3xl font-bold text-primary mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </Card>
            ))}
          </div>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Workouts</h3>
              <Button size="sm" variant="outline"><Plus size={14} /> Log Workout</Button>
            </div>
            <div className="space-y-3">
              {mockWorkoutLogs.map(log => (
                <div key={log.id} className="flex items-center gap-4 p-4 bg-light-olive/30 rounded-xl">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Dumbbell size={18} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{log.workout_type}</p>
                    <p className="text-xs text-gray-400">{formatDate(log.log_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary text-sm">{log.duration_minutes} min</p>
                    <p className="text-xs text-gray-400">{log.calories_burned} cal</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
