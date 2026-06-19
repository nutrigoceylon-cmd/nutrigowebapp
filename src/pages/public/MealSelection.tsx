import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Check, ChevronRight, ShoppingCart, Minus, Plus, ArrowLeft } from 'lucide-react'
import type { MealPlan, Meal, MealType } from '../../types'
import { supabase, supabaseConfigured } from '../../lib/supabase'
import { formatCurrency, getGoalLabel } from '../../lib/helpers'
import { buildWhatsAppUrl } from '../../lib/site'
import { Button } from '../../components/ui/Button'

const MEAL_TYPE_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']
const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
}

interface SelectedMeal {
  meal: Meal
  quantity: number
}

export function MealSelection() {
  const { planId } = useParams<{ planId: string }>()
  const navigate = useNavigate()

  const [plan, setPlan] = useState<MealPlan | null>(null)
  const [meals, setMeals] = useState<Meal[]>([])
  const [selectedMeals, setSelectedMeals] = useState<Map<string, SelectedMeal>>(new Map())
  const [activeTab, setActiveTab] = useState<MealType>('breakfast')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!planId) { navigate('/menu'); return }
    loadPlanAndMeals(planId)
  }, [planId])

  async function loadPlanAndMeals(id: string) {
    if (!supabaseConfigured) {
      setLoading(false)
      return
    }

    const [{ data: planData }, { data: mealData }] = await Promise.all([
      supabase.from('meal_plans').select('*').eq('id', id).single(),
      // Load meals for this specific plan; fall back to all active meals if none assigned yet
      supabase.from('meals').select('*').eq('meal_plan_id', id).eq('is_active', true).order('meal_type').order('name'),
    ])

    if (!planData) { navigate('/menu'); return }
    setPlan(planData)

    setMeals(mealData ?? [])
    setLoading(false)
  }

  const mealsByType = useMemo(() => {
    const grouped: Partial<Record<MealType, Meal[]>> = {}
    for (const meal of meals) {
      if (!grouped[meal.meal_type]) grouped[meal.meal_type] = []
      grouped[meal.meal_type]!.push(meal)
    }
    return grouped
  }, [meals])

  const availableTabs = MEAL_TYPE_ORDER.filter(t => (mealsByType[t]?.length ?? 0) > 0)

  const selectedList = Array.from(selectedMeals.values())
  const totalSelected = selectedList.reduce((s, sm) => s + sm.quantity, 0)
  const totalCalories = selectedList.reduce(
    (s, sm) => s + sm.meal.calories * sm.quantity,
    0
  )

  function toggleMeal(meal: Meal) {
    setSelectedMeals(prev => {
      const next = new Map(prev)
      if (next.has(meal.id)) next.delete(meal.id)
      else next.set(meal.id, { meal, quantity: 1 })
      return next
    })
  }

  function adjustQty(mealId: string, delta: number) {
    setSelectedMeals(prev => {
      const next = new Map(prev)
      const entry = next.get(mealId)
      if (!entry) return prev
      const newQty = entry.quantity + delta
      if (newQty <= 0) next.delete(mealId)
      else next.set(mealId, { ...entry, quantity: newQty })
      return next
    })
  }

  function buildWhatsAppMessage() {
    if (!plan) return ''

    const selectedMealLines = selectedList.map(({ meal, quantity }) => {
      const macroSummary = `${meal.calories} kcal | P ${meal.protein}g | C ${meal.carbs}g | F ${meal.fat}g`
      return `- ${meal.name} (${meal.meal_type}, qty: ${quantity})\n  ${macroSummary}`
    })

    return [
      'Hi NutriGo! I would like to place an order.',
      '',
      '*Selected Meal Plan*',
      `- Plan: ${plan.name}`,
      `- Goal: ${getGoalLabel(plan.goal_type)}`,
      `- Duration: ${plan.plan_duration}`,
      `- Plan price: ${formatCurrency(plan.price)}`,
      '',
      '*Selected Meals*',
      ...selectedMealLines,
      '',
      '*Order Summary*',
      `- Total items: ${totalSelected}`,
      `- Total calories: ${totalCalories.toLocaleString()} kcal`,
      '',
      '*Please share:*',
      '- Delivery availability',
      '- Earliest delivery slot',
      '- Payment options',
      '',
      'Thank you!',
    ].join('\n')
  }

  function proceedToWhatsAppOrder() {
    if (selectedMeals.size === 0 || !plan) return
    window.open(buildWhatsAppUrl(buildWhatsAppMessage()), '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  if (!plan) return null

  const goalColors: Record<string, string> = {
    weight_loss:       'bg-blue-50 text-blue-700 border-blue-200',
    muscle_gain:       'bg-orange-50 text-orange-700 border-orange-200',
    healthy_lifestyle: 'bg-green-50 text-green-700 border-green-200',
  }

  const planStats = [
    { label: 'Goal', value: getGoalLabel(plan.goal_type) },
    { label: 'Duration', value: plan.plan_duration.charAt(0).toUpperCase() + plan.plan_duration.slice(1) },
    { label: 'Calories / day', value: `${plan.calories_per_day} kcal` },
    { label: 'Price', value: `${formatCurrency(plan.price)} / ${plan.plan_duration}` },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Plan Header */}
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft size={15} /> Back to plans
          </Link>

          {/* Plan detail card */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Image */}
            {plan.image_url && (
              <div className="w-full lg:w-48 h-36 lg:h-32 rounded-2xl overflow-hidden flex-shrink-0">
                <img src={plan.image_url} alt={plan.name} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex-1">
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border mb-3 ${goalColors[plan.goal_type] ?? goalColors.healthy_lifestyle}`}>
                {getGoalLabel(plan.goal_type)}
              </span>
              <h1 className="font-serif text-3xl font-bold mb-2">{plan.name}</h1>
              <p className="text-white/65 text-sm leading-relaxed mb-4 max-w-2xl">{plan.description}</p>

              {/* Stats row */}
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {planStats.map(stat => (
                  <div key={stat.label}>
                    <p className="text-white/40 text-xs">{stat.label}</p>
                    <p className="text-white font-semibold text-sm">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA on desktop */}
            <div className="hidden lg:block text-right flex-shrink-0">
              <p className="text-4xl font-bold text-gold">{formatCurrency(plan.price)}</p>
              <p className="text-white/50 text-sm capitalize mt-0.5">per {plan.plan_duration}</p>
              <p className="text-white/40 text-xs mt-3">Select your meals below ↓</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">
          {/* Meal Grid – main column */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-serif text-xl font-bold text-primary">Choose Your Meals</h2>
                <p className="text-sm text-gray-400 mt-0.5">Select the meals you'd like included in your <span className="font-medium text-gray-600">{plan.name}</span> plan</p>
              </div>
            </div>

            {/* Meal type tabs */}
            {availableTabs.length > 1 && (
              <div className="flex gap-2 mb-6 flex-wrap">
                {availableTabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                      activeTab === tab
                        ? 'bg-primary text-white border-primary'
                        : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary bg-white'
                    }`}
                  >
                    {MEAL_TYPE_LABELS[tab]}
                  </button>
                ))}
              </div>
            )}

            {(availableTabs.length === 0 ? MEAL_TYPE_ORDER : [activeTab]).map(type => {
              const typeMeals = mealsByType[type] ?? []
              if (typeMeals.length === 0) return null
              return (
                <div key={type}>
                  {availableTabs.length <= 1 && (
                    <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-3">
                      {MEAL_TYPE_LABELS[type]}
                    </h3>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                    {typeMeals.map(meal => {
                      const sel = selectedMeals.get(meal.id)
                      const isSelected = Boolean(sel)
                      return (
                        <div
                          key={meal.id}
                          className={`bg-white rounded-2xl overflow-hidden border-2 transition-all cursor-pointer shadow-sm ${
                            isSelected
                              ? 'border-gold shadow-gold/20 shadow-md'
                              : 'border-transparent hover:border-gray-200 hover:shadow-md'
                          }`}
                          onClick={() => toggleMeal(meal)}
                        >
                          <div className="relative h-44">
                            {meal.image_url
                              ? <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full bg-light-olive/50 flex items-center justify-center text-4xl">🥗</div>
                            }
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-7 h-7 bg-gold rounded-full flex items-center justify-center shadow-sm">
                                <Check size={14} className="text-white" />
                              </div>
                            )}
                            <div className="absolute top-2 left-2">
                              <span className="bg-white/90 text-gold text-xs font-semibold px-2 py-0.5 rounded-full capitalize">
                                {meal.meal_type}
                              </span>
                            </div>
                          </div>

                          <div className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-1">{meal.name}</h4>
                            {meal.description && (
                              <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-2">{meal.description}</p>
                            )}
                            {meal.ingredients?.length > 0 && (
                              <ul className="mb-3 space-y-0.5">
                                {meal.ingredients.slice(0, 4).map((ing, i) => (
                                  <li key={i} className="flex items-start gap-1.5 text-xs text-gray-500">
                                    <span className="text-gold mt-px leading-none">•</span>
                                    <span className="leading-snug">{ing}</span>
                                  </li>
                                ))}
                                {meal.ingredients.length > 4 && (
                                  <li className="text-xs text-gray-400 italic pl-3">+{meal.ingredients.length - 4} more ingredients</li>
                                )}
                              </ul>
                            )}
                            <div className="grid grid-cols-3 gap-1 text-center text-xs mb-3">
                              <div className="bg-light-olive/60 rounded-lg p-1.5">
                                <p className="font-bold text-primary">{meal.protein}g</p>
                                <p className="text-gray-400">Protein</p>
                              </div>
                              <div className="bg-light-olive/60 rounded-lg p-1.5">
                                <p className="font-bold text-primary">{meal.carbs}g</p>
                                <p className="text-gray-400">Carbs</p>
                              </div>
                              <div className="bg-light-olive/60 rounded-lg p-1.5">
                                <p className="font-bold text-primary">{meal.fat}g</p>
                                <p className="text-gray-400">Fat</p>
                              </div>
                            </div>
                            <p className="text-center text-xs text-gray-400">{meal.calories} calories · {meal.prep_time} min prep</p>

                            {isSelected && (
                              <div
                                className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100"
                                onClick={e => e.stopPropagation()}
                              >
                                <span className="text-xs font-medium text-gray-600">Quantity</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => adjustQty(meal.id, -1)}
                                    className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <span className="font-semibold text-primary w-4 text-center">{sel!.quantity}</span>
                                  <button
                                    onClick={() => adjustQty(meal.id, 1)}
                                    className="w-6 h-6 rounded-full bg-gold/10 hover:bg-gold/20 flex items-center justify-center transition-colors cursor-pointer"
                                  >
                                    <Plus size={12} className="text-gold" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {meals.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-5xl mb-4">🥗</p>
                <p>No meals available for this plan yet.</p>
                <Link to="/menu" className="text-gold hover:underline text-sm mt-2 inline-block">
                  Choose a different plan
                </Link>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart size={18} className="text-gold" />
                <h3 className="font-semibold text-gray-900">Order Summary</h3>
              </div>

              <div className="bg-light-olive/50 rounded-xl p-3 mb-4">
                <p className="font-semibold text-primary text-sm">{plan.name}</p>
                <p className="text-gray-500 text-xs capitalize">{plan.plan_duration} plan · {getGoalLabel(plan.goal_type)}</p>
              </div>

              {selectedList.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No meals selected yet</p>
              ) : (
                <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                  {selectedList.map(({ meal, quantity }) => (
                    <div key={meal.id} className="flex items-center justify-between text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{meal.name}</p>
                        <p className="text-gray-400 text-xs capitalize">{meal.meal_type}</p>
                      </div>
                      <span className="text-gray-500 text-xs ml-2 flex-shrink-0">×{quantity}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedList.length > 0 && (
                <div className="border-t border-gray-100 pt-3 mb-4 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Meals selected</span>
                    <span>{totalSelected}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Total calories</span>
                    <span>{totalCalories.toLocaleString()} cal</span>
                  </div>
                  <div className="flex justify-between font-bold text-primary text-base pt-1">
                    <span>Plan price</span>
                    <span>{formatCurrency(plan.price)}</span>
                  </div>
                </div>
              )}

              <Button
                fullWidth
                onClick={proceedToWhatsAppOrder}
                disabled={selectedMeals.size === 0}
                className="flex items-center justify-center gap-2"
              >
                Order via WhatsApp <ChevronRight size={16} />
              </Button>

              {selectedMeals.size === 0 && (
                <p className="text-center text-xs text-gray-400 mt-2">Select at least one meal</p>
              )}
            </div>
          </div>
        </div>

        {/* Mobile sticky footer */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg z-40">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold text-primary">{formatCurrency(plan.price)}</p>
              <p className="text-gray-400 text-xs">{totalSelected} meal{totalSelected !== 1 ? 's' : ''} selected · {totalCalories.toLocaleString()} cal</p>
            </div>
            <Button
              onClick={proceedToWhatsAppOrder}
              disabled={selectedMeals.size === 0}
              className="flex items-center gap-2"
            >
              WhatsApp Order <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      </div>
      {/* Bottom padding for mobile footer */}
      <div className="lg:hidden h-24" />
    </div>
  )
}
