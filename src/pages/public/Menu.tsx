import { useState, useEffect } from 'react'
import { ChevronRight, Filter, X, MessageCircle, Phone, Clock } from 'lucide-react'
import type { MealPlan, Meal, MealType, GoalType } from '../../types'
import { supabase, supabaseConfigured } from '../../lib/supabase'
import { formatCurrency, getGoalLabel } from '../../lib/helpers'
import { buildWhatsAppUrl } from '../../lib/site'

// ─── Filter options (preserved) ───────────────────────────────────────────────
const mealTypes: { value: MealType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
]

const goals: { value: GoalType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Goals' },
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'healthy_lifestyle', label: 'Healthy Lifestyle' },
]

const planIncludes = [
  'Personalized macro targets',
  'Daily fresh delivery',
  'Nutritionist support',
  'Progress tracking dashboard',
  'Flexible pause / cancel anytime',
  'Weekly menu rotation',
]

const goalColors: Record<string, { bg: string; text: string; border: string }> = {
  weight_loss: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  muscle_gain: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  healthy_lifestyle: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
}

export function Menu() {
  // ─── State (all original state preserved) ─────────────────────────────────
  const [loading, setLoading] = useState(true)
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [meals, setMeals] = useState<Meal[]>([])
  const [selectedMealType, setSelectedMealType] = useState<MealType | 'all'>('all')

  // Preserved for future use (subscription plan view)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<GoalType | 'all'>('all')

  // New: which meal card is open in the detail modal
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)

  useEffect(() => {
    let cancelled = false

    if (!supabaseConfigured) {
      setLoading(false)
      return () => { cancelled = true }
    }

    async function loadMenuData() {
      setLoading(true)

      const [plansResult, mealsResult] = await Promise.all([
        supabase.from('meal_plans').select('*').eq('is_active', true).order('created_at'),
        supabase.from('meals').select('*').eq('is_active', true).order('meal_type'),
      ])

      if (cancelled) return

      setMealPlans(plansResult.data ?? [])
      setMeals(mealsResult.data ?? [])
      setLoading(false)
    }

    loadMenuData().catch(() => {
      if (cancelled) return
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredMeals = meals.filter(m =>
    selectedMealType === 'all' || m.meal_type === selectedMealType
  )

  function getParentPlan(meal: Meal): MealPlan {
    return mealPlans.find(p => p.id === meal.meal_plan_id) ?? {
      id: meal.id,
      name: meal.name,
      description: meal.description ?? '',
      goal_type: 'healthy_lifestyle',
      plan_duration: 'daily',
      price: 0,
      calories_per_day: meal.calories,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  // ─── WhatsApp helpers ──────────────────────────────────────────────────────
  function buildWhatsAppMessage(meal: Meal): string {
    const parentPlan = getParentPlan(meal)
    const ingredientLines = meal.ingredients?.length > 0
      ? meal.ingredients.map(i => `- ${i}`).join('\n')
      : '- Details available on request'
    const allergenLines = meal.allergens?.length > 0
      ? meal.allergens.map(allergen => `- ${allergen}`).join('\n')
      : '- No major allergens listed'

    const text = [
      'Hi NutriGo! I would like to place an order.',
      '',
      '*Selected Menu Item*',
      `- Menu name: ${meal.name}`,
      `- Meal type: ${meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}`,
      `- Meal plan: ${parentPlan.name}`,
      `- Goal: ${getGoalLabel(parentPlan.goal_type)}`,
      `- Prep time: ${meal.prep_time} min`,
      '',
      "*What's Included*",
      ingredientLines,
      '',
      '*Nutrition Information*',
      `- Calories: ${meal.calories} kcal`,
      `- Protein: ${meal.protein}g`,
      `- Carbs: ${meal.carbs}g`,
      `- Fat: ${meal.fat}g`,
      `- Fiber: ${meal.fiber}g`,
      '',
      '*Allergen Information*',
      allergenLines,
      '',
      '*Please share:*',
      '- Price',
      '- Delivery availability',
      '- Earliest delivery slot',
      '- Payment options',
      '',
      'Thank you!',
    ].join('\n')

    return text
  }

  // Preserved: used by the hidden subscription plan cards below
  const subscribeTarget = (planId: string) => `/meal-selection/${planId}`

  return (
    <div>
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="bg-light-olive/30 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-3">Fresh & Healthy</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-primary mb-4">
            Our Menu
          </h1>
          <p className="text-gray-500 text-lg">
            Nutritionist-designed meals made with fresh ingredients, delivered to your door.
          </p>
        </div>
      </section>

      {/* ── HIDDEN: Subscription plan cards ─────────────────────────────────
           All variables preserved. Toggle `false` to `true` to restore.
      ──────────────────────────────────────────────────────────────────── */}
      {false && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Goal filter */}
            <div className="flex gap-2 flex-wrap mb-8">
              {goals.map(g => (
                <button
                  key={g.value}
                  onClick={() => setSelectedGoal(g.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${selectedGoal === g.value ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600'}`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            {/* Plan cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {mealPlans.filter(p => selectedGoal === 'all' || p.goal_type === selectedGoal).map(plan => {
                const colors = goalColors[plan.goal_type] ?? goalColors.healthy_lifestyle
                const selected = selectedPlan === plan.id
                return (
                  <div
                    key={plan.id}
                    className={`bg-white rounded-2xl overflow-hidden border-2 transition-all duration-200 shadow-sm cursor-pointer ${selected ? 'border-gold shadow-gold/20 shadow-lg' : 'border-transparent hover:border-gray-200 hover:shadow-md'}`}
                    onClick={() => setSelectedPlan(selected ? null : plan.id)}
                  >
                    <div className="relative h-52">
                      {plan.image_url
                        ? <img src={plan.image_url} alt={plan.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-light-olive/40" />
                      }
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}>
                        {getGoalLabel(plan.goal_type)}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-serif font-bold text-xl text-white">{plan.name}</h3>
                        <p className="text-white/70 text-xs capitalize">{plan.plan_duration} plan</p>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-gray-500 text-sm leading-relaxed mb-4">{plan.description}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-2xl text-primary">{formatCurrency(plan.price)}</span>
                          <span className="text-gray-400 text-sm">/{plan.plan_duration}</span>
                        </div>
                        <a href={subscribeTarget(plan.id)} className="bg-gold text-white px-4 py-2 rounded-xl text-sm font-medium">
                          Select Plan
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Plan includes */}
            <div className="bg-light-olive/30 rounded-2xl p-8 border border-sage/30">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {planIncludes.map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <ChevronRight size={15} className="text-green-600 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Meal type filter ──────────────────────────────────────────────── */}
      <section className="py-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={15} className="text-gray-400 mr-1" />
            {mealTypes.map(t => (
              <button
                key={t.value}
                onClick={() => setSelectedMealType(t.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                  selectedMealType === t.value
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Meal grid ─────────────────────────────────────────────────────── */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="rounded-[2rem] border border-gold/15 bg-gradient-to-br from-white via-light-olive/40 to-light-green/60 px-6 py-14 shadow-sm">
              <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                  <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/25 border-t-gold" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">Loading Menu</p>
                <h2 className="mt-2 font-serif text-3xl font-bold text-primary">Preparing today&apos;s plans and meals</h2>
                <p className="mt-3 text-sm leading-6 text-gray-500">
                  We&apos;re fetching the latest meal plans and nutrition details for you.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                  >
                    <div className="h-44 animate-pulse bg-light-olive/70" />
                    <div className="space-y-3 p-4">
                      <div className="h-5 w-20 animate-pulse rounded-full bg-gold/15" />
                      <div className="h-5 w-3/4 animate-pulse rounded-lg bg-gray-200" />
                      <div className="h-3 w-full animate-pulse rounded-lg bg-gray-100" />
                      <div className="h-3 w-2/3 animate-pulse rounded-lg bg-gray-100" />
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        {Array.from({ length: 3 }).map((__, metricIndex) => (
                          <div key={metricIndex} className="h-14 animate-pulse rounded-lg bg-light-olive/60" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredMeals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredMeals.map(meal => (
                <div
                  key={meal.id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
                  onClick={() => setSelectedMeal(meal)}
                >
                  {meal.image_url
                    ? <img src={meal.image_url} alt={meal.name} className="w-full h-44 object-cover" />
                    : <div className="w-full h-44 bg-light-olive/40 flex items-center justify-center text-4xl">🥗</div>
                  }
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gold capitalize bg-gold/10 px-2 py-0.5 rounded-full">
                        {meal.meal_type}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={11} /> {meal.prep_time} min
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{meal.name}</h4>
                    {meal.description && (
                      <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-2">{meal.description}</p>
                    )}
                    {meal.ingredients?.length > 0 && (
                      <p className="text-xs text-gray-400 mb-3">{meal.ingredients.length} ingredients · tap to see details</p>
                    )}
                    <div className="grid grid-cols-3 gap-1 text-center text-xs">
                      <div className="bg-light-olive/50 rounded-lg p-1.5">
                        <p className="font-bold text-primary">{meal.protein}g</p>
                        <p className="text-gray-400">Protein</p>
                      </div>
                      <div className="bg-light-olive/50 rounded-lg p-1.5">
                        <p className="font-bold text-primary">{meal.carbs}g</p>
                        <p className="text-gray-400">Carbs</p>
                      </div>
                      <div className="bg-light-olive/50 rounded-lg p-1.5">
                        <p className="font-bold text-primary">{meal.fat}g</p>
                        <p className="text-gray-400">Fat</p>
                      </div>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-2">{meal.calories} calories</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">🥗</p>
              <p className="text-lg">No meals available yet.</p>
              <p className="text-sm mt-1">Check back soon or contact us on WhatsApp.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-primary">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl font-bold text-white mb-4">Not Sure What to Order?</h2>
          <p className="text-white/60 mb-8">
            Message us on WhatsApp and our nutrition team will help you choose the right meal for your goals.
          </p>
          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20be5c] text-white px-8 py-3 rounded-xl font-medium transition-colors"
          >
            <MessageCircle size={18} /> Chat on WhatsApp
          </a>
        </div>
      </section>

      {/* ── Meal detail modal ─────────────────────────────────────────────── */}
      {selectedMeal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedMeal(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative">
              {selectedMeal.image_url
                ? <img src={selectedMeal.image_url} alt={selectedMeal.name} className="w-full h-56 object-cover rounded-t-2xl" />
                : <div className="w-full h-56 bg-light-olive/40 rounded-t-2xl flex items-center justify-center text-5xl">🥗</div>
              }
              <button
                onClick={() => setSelectedMeal(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors cursor-pointer"
              >
                <X size={16} className="text-gray-600" />
              </button>
              <div className="absolute top-3 left-3">
                <span className="bg-white/90 text-gold text-xs font-semibold px-2.5 py-1 rounded-full capitalize shadow-sm">
                  {selectedMeal.meal_type}
                </span>
              </div>
            </div>

            <div className="p-6">
              <h2 className="font-serif text-2xl font-bold text-primary mb-1">{selectedMeal.name}</h2>
              {selectedMeal.description && (
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{selectedMeal.description}</p>
              )}

              {/* Ingredients */}
              {selectedMeal.ingredients?.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Ingredients</h4>
                  <ul className="space-y-2 bg-light-olive/30 rounded-xl p-4">
                    {selectedMeal.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                        <span className="text-gold font-bold mt-0.5 leading-none flex-shrink-0">•</span>
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Nutrition */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'Calories', value: String(selectedMeal.calories) },
                  { label: 'Protein', value: `${selectedMeal.protein}g` },
                  { label: 'Carbs', value: `${selectedMeal.carbs}g` },
                  { label: 'Fat', value: `${selectedMeal.fat}g` },
                ].map(s => (
                  <div key={s.label} className="bg-light-olive/50 rounded-xl p-2.5 text-center">
                    <p className="font-bold text-primary text-sm">{s.value}</p>
                    <p className="text-gray-400 text-xs">{s.label}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
                <Clock size={12} /> Prep time: {selectedMeal.prep_time} min
              </p>

              {/* ── Order actions ─────────────────────────────────────────── */}
              <div className="border-t border-gray-100 pt-5 space-y-3">

                {/* WhatsApp */}
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Order via WhatsApp</p>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={buildWhatsAppUrl(buildWhatsAppMessage(selectedMeal))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20be5c] text-white rounded-xl py-3 text-sm font-medium transition-colors"
                  >
                    <MessageCircle size={16} /> Message
                  </a>
                  <a
                    href={buildWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 border border-[#25D366]/40 bg-[#25D366]/8 hover:bg-[#25D366]/15 text-[#128C7E] rounded-xl py-3 text-sm font-medium transition-colors"
                  >
                    <Phone size={16} /> Call
                  </a>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400">or</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* Checkout */}
                <button
                  type="button"
                  disabled
                  className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-500 rounded-xl py-3 text-sm font-semibold cursor-not-allowed"
                >
                  Proceed to Checkout <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
