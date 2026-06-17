import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, ShieldCheck, ChevronRight, BookOpen, Headphones, CalendarDays, Star, Play, Calculator, Users, Clock, BadgeCheck } from 'lucide-react'
import { OrderNowButton } from '../../components/delivery/OrderNowButton'
import { mockMealPlans, mockArticles } from '../../data/mockData'
import { formatCurrency, getGoalLabel } from '../../lib/helpers'

const steps = [
  { icon: '🎯', num: '1', title: 'Choose Your Goal', desc: 'Select your goal: Weight Loss, Muscle Gain or Healthy Lifestyle.' },
  { icon: '📋', num: '2', title: 'Select Your Plan', desc: 'Pick a plan that suits you. Customize if needed.' },
  { icon: '🍳', num: '3', title: 'We Prepare & Deliver', desc: 'Our chefs prepare your meals fresh and deliver to your door.' },
  { icon: '📊', num: '4', title: 'Track & Achieve', desc: 'Track your progress with our tools and expert support.' },
]

const planColors: Record<string, { title: string; icon: string; border: string; bg: string }> = {
  weight_loss: { title: 'text-accent', icon: '🏃', border: 'border-accent/20', bg: 'bg-accent/5' },
  muscle_gain: { title: 'text-blue-600', icon: '💪', border: 'border-blue-200', bg: 'bg-blue-50/50' },
  healthy_lifestyle: { title: 'text-orange-500', icon: '🥗', border: 'border-orange-200', bg: 'bg-orange-50/50' },
}

const testimonials = [
  { name: 'Jessica M.', goal: 'Lost 18 lbs', avatar: 'J', color: 'bg-accent', text: 'NutriGo completely changed my relationship with food. The meals are genuinely delicious.', stars: 5 },
  { name: 'Marcus T.', goal: 'Gained 12 lbs muscle', avatar: 'M', color: 'bg-blue-500', text: 'As a competitive athlete, I need precise nutrition. The Power Builder plan delivers exactly that.', stars: 5 },
  { name: 'Priya K.', goal: '4 months subscriber', avatar: 'P', color: 'bg-orange-400', text: 'The convenience is unmatched. I used to spend Sundays meal prepping. Now I have that time back.', stars: 5 },
]

const activityMultipliers: Record<string, { label: string; value: number }> = {
  sedentary:        { label: 'Sedentary (little/no exercise)', value: 1.2 },
  lightly_active:   { label: 'Lightly active (1–3 days/wk)', value: 1.375 },
  moderately_active:{ label: 'Moderately active (3–5 days/wk)', value: 1.55 },
  very_active:      { label: 'Very active (6–7 days/wk)', value: 1.725 },
  extra_active:     { label: 'Extra active (athlete/physical job)', value: 1.9 },
}

function calcTDEE(age: number, gender: 'male' | 'female', heightCm: number, weightKg: number, activity: string): number {
  const bmr = gender === 'male'
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161
  return Math.round(bmr * (activityMultipliers[activity]?.value ?? 1.2))
}

export function Home() {
  const featuredPlans = mockMealPlans.filter(p => p.is_active).slice(0, 3)
  const featuredArticles = mockArticles.filter(a => a.is_published).slice(0, 2)

  const [calc, setCalc] = useState({ age: '', gender: 'male' as 'male' | 'female', height: '', weight: '', activity: 'moderately_active' })
  const [tdee, setTdee] = useState<number | null>(null)

  function handleCalc() {
    const age = Number(calc.age)
    const height = Number(calc.height)
    const weight = Number(calc.weight)
    if (!age || !height || !weight || age < 10 || age > 110) return
    setTdee(calcTDEE(age, calc.gender, height, weight, calc.activity))
  }

  const goalFromTdee = tdee
    ? tdee < 1800 ? 'weight_loss' : tdee > 2500 ? 'muscle_gain' : 'healthy_lifestyle'
    : null

  return (
    <div className="bg-white">
      {/* ── HERO ── */}
      <section className="bg-surface overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-light-green text-accent border border-accent/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <Leaf size={13} />
                Sri Lanka's Trusted Healthy Meal Partner
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
                Healthy Eating<br />
                <span className="text-accent">Made Easy</span>
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                Scientifically balanced meal plans, delivered fresh to your door. Achieve your goals with NutriGo.
              </p>
              {/* <div className="flex flex-wrap gap-4 mb-10">
                <OrderNowButton
                  unstyled
                  className="inline-flex items-center gap-2 bg-primary hover:bg-secondary text-white font-semibold px-7 py-3.5 rounded-xl transition-colors shadow-md text-base"
                  icon={<ArrowRight size={18} />}
                  iconPosition="end"
                >
                  Order Now
                </OrderNowButton>
                <button className="inline-flex items-center gap-2.5 text-gray-600 hover:text-primary font-medium text-base transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-primary transition-colors">
                    <Play size={14} className="text-primary ml-0.5" />
                  </div>
                  How it works
                </button>
              </div> */}

              {/* Trust badges */}
              <div className="flex items-center gap-6 pt-6 border-t border-gray-100 flex-wrap">
                {[
                  { icon: '🌿', label: 'Scientifically Balanced' },
                  { icon: '👨‍🍳', label: 'Chef Prepared' },
                  { icon: '🚚', label: 'Delivered Fresh' },
                ].map(b => (
                  <div key={b.label} className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="text-lg">{b.icon}</span>
                    <span className="hidden sm:inline font-medium">{b.label}</span>
                  </div>
                ))}
                {/* <a
                  href="#calorie-calculator"
                  className="flex items-center gap-1.5 text-sm font-medium text-gold hover:text-gold/80 transition-colors ml-auto"
                >
                  <Calculator size={14} /> Calculate your calories →
                </a> */}
              </div>
            </div>

            {/* Right — food image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1547592180-85f173990554?w=900"
                  alt="Healthy meal delivery"
                  className="w-full h-[420px] object-cover"
                />
                {/* Award badge */}
                <div className="absolute bottom-5 right-5 bg-primary text-white rounded-2xl px-4 py-3 text-center shadow-xl">
                  <div className="text-xl mb-0.5">🏆</div>
                  <p className="text-xs font-bold leading-tight">Business Spark 2026</p>
                  <p className="text-xs text-white/70">1st Place Winner</p>
                </div>
              </div>
              {/* Floating stat card */}
              <div className="absolute -left-6 top-8 bg-white rounded-2xl shadow-xl px-5 py-4 border border-gray-100 hidden lg:block">
                <p className="text-2xl font-bold text-primary">5000+</p>
                <p className="text-xs text-gray-400 mt-0.5">Happy Customers</p>
                <div className="flex gap-0.5 mt-2">
                  {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-primary/10 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Quick Action</p>
                  <h3 className="mt-2 font-serif text-2xl font-bold text-primary">Order Meal</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Choose a fresh meal plan and start your delivery in just a few steps.
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-light-green text-accent">
                  <Leaf size={22} />
                </div>
              </div>
              <OrderNowButton
                unstyled
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-dark px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 ring-1 ring-accent/20 hover:-translate-y-0.5 hover:from-accent-dark hover:to-primary"
                icon={<ArrowRight size={16} />}
                iconPosition="end"
              >
                Order Meal
              </OrderNowButton>
            </div>

            <div className="rounded-3xl border border-accent/10 bg-gradient-to-br from-white to-light-green/60 p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Expert Support</p>
                  <h3 className="mt-2 font-serif text-2xl font-bold text-primary">Book Health Advisory Session</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Speak with a qualified advisor for nutrition guidance tailored to your goals.
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                  <CalendarDays size={22} />
                </div>
              </div>
              <Link
                to="/sessions"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 ring-1 ring-primary/15 hover:-translate-y-0.5 hover:from-secondary hover:to-primary"
              >
                Book Session <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <a
            href="#calorie-calculator"
            className="mt-4 flex w-full items-center justify-center gap-4 rounded-3xl border border-accent/15 bg-white px-6 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-md"
          >
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Nutrition Tool</p>
              <h3 className="mt-1 font-serif text-xl font-bold text-primary">Go to Calorie Calculator</h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-light-green text-accent">
              <Calculator size={20} />
            </div>
          </a>
        </div>
      </section>

      

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
              How <span className="text-accent">NutriGo</span> Works
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-shadow">
                {/* Number circle */}
                <div className="w-12 h-12 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center mx-auto mb-4 relative z-10">
                  {step.num}
                </div>
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-[3.5rem] left-[calc(50%+2.5rem)] right-0 border-t-2 border-dashed border-gray-200 z-0" />
                )}
                <div className="text-3xl mb-3">{step.icon}</div>
                <h3 className="font-semibold text-gray-900 text-base mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MEAL PLANS ── */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
                Choose a <span className="text-accent">Meal Plan</span>
              </h2>
            </div>
            <Link to="/menu" className="hidden sm:flex items-center gap-1.5 text-accent font-medium hover:text-accent-dark transition-colors text-sm">
              View All Plans <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPlans.map(plan => {
              const style = planColors[plan.goal_type]
              return (
                <div key={plan.id} className={`bg-white rounded-2xl overflow-hidden border ${style.border} shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200`}>
                  <div className="relative h-48 overflow-hidden">
                    <img src={plan.image_url} alt={plan.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1.5 border border-gray-100">
                      <span>{style.icon}</span>
                      <span className={style.title}>{getGoalLabel(plan.goal_type)}</span>
                    </div>
                  </div>
                  <div className={`p-5 ${style.bg}`}>
                    <h3 className={`font-semibold text-lg mb-2 ${style.title}`}>{getGoalLabel(plan.goal_type)} Plan</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{plan.description.slice(0, 95)}...</p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-400">
                        <span className="font-semibold text-gray-700">{plan.calories_per_day}</span> cal/day
                      </div>
                      <span className="font-bold text-gray-900 text-lg">{formatCurrency(plan.price)}<span className="text-xs font-normal text-gray-400">/wk</span></span>
                    </div>
                    <OrderNowButton
                      unstyled
                      className="block w-full text-center border border-gray-200 hover:border-primary text-gray-600 hover:text-primary py-2.5 rounded-xl text-sm font-medium transition-colors bg-white"
                    >
                      See Menu
                    </OrderNowButton>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── SESSIONS ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            {/* Left — content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-gold/10 text-gold border border-gold/20 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
                <Users size={14} /> 1-on-1 Expert Sessions
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Personalized Guidance<br />
                <span className="text-accent">From Real Experts</span>
              </h2>
              <p className="text-gray-500 leading-relaxed mb-7">
                Go beyond meal plans. Book private sessions with certified nutritionists, dietitians, and wellness coaches. Get a strategy built around your body, lifestyle, and goals.
              </p>

              <div className="space-y-2 mb-8">
                {[
                  { icon: '🥗', title: 'Nutrition Consultation', desc: '60-min deep dive into your diet, health history, and goals.' },
                  { icon: '📋', title: 'Custom Meal Planning', desc: 'A fully personalized weekly meal plan built just for you.' },
                  { icon: '💪', title: 'Fitness & Wellness Coaching', desc: 'Combine smart nutrition with a fitness plan for faster results.' },
                  { icon: '🩺', title: 'Health Assessment', desc: 'Comprehensive review with a registered dietitian or doctor.' },
                ].map(s => (
                  <div key={s.title} className="flex items-start gap-3.5 p-3.5 rounded-xl hover:bg-surface transition-colors group">
                    <span className="text-xl mt-0.5 flex-shrink-0">{s.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm group-hover:text-accent transition-colors">{s.title}</p>
                      <p className="text-gray-400 text-xs leading-relaxed mt-0.5">{s.desc}</p>
                    </div>
                    <ChevronRight size={15} className="text-gray-300 group-hover:text-accent ml-auto mt-1 flex-shrink-0 transition-colors" />
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/sessions"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-secondary text-white font-semibold px-7 py-3.5 rounded-xl transition-colors shadow-md"
                >
                  Book a Session <ArrowRight size={17} />
                </Link>
                <Link
                  to="/sessions"
                  className="inline-flex items-center gap-2 border border-gray-200 hover:border-primary text-gray-600 hover:text-primary font-medium px-6 py-3.5 rounded-xl transition-colors text-sm"
                >
                  View All Experts
                </Link>
              </div>
            </div>

            {/* Right — visual */}
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=700"
                alt="1-on-1 nutrition session"
                className="rounded-3xl shadow-xl w-full h-[440px] object-cover"
              />
              {/* Rating card */}
              <div className="absolute bottom-6 left-6 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                <div className="flex gap-0.5 mb-1.5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="font-bold text-gray-900 text-sm">4.9 / 5 Rating</p>
                <p className="text-xs text-gray-400 mt-0.5">Based on 1,200+ sessions</p>
              </div>
              {/* Expert count badge */}
              <div className="absolute top-6 right-6 bg-primary text-white rounded-2xl px-4 py-3 text-center shadow-lg">
                <p className="text-2xl font-bold">20+</p>
                <p className="text-xs text-white/70 mt-0.5">Certified Experts</p>
              </div>
              {/* Stats row */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-[85%] bg-white rounded-2xl shadow-lg border border-gray-100 px-5 py-3 flex justify-around hidden lg:flex">
                {[
                  { icon: <Clock size={15} className="text-gold" />, value: '30 min', label: 'Free Intro Call' },
                  { icon: <BadgeCheck size={15} className="text-accent" />, value: '100%', label: 'Certified Experts' },
                  { icon: <Users size={15} className="text-primary" />, value: '5000+', label: 'Sessions Done' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">{s.icon}<span className="font-bold text-gray-900 text-sm">{s.value}</span></div>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CALORIE CALCULATOR TEASER ── */}
      <a
        href="#calorie-calculator"
        className="block bg-gradient-to-r from-primary/5 via-gold/5 to-primary/5 border-y border-gold/20 py-5 hover:from-primary/10 hover:to-primary/10 transition-colors group"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gold/20 flex items-center justify-center flex-shrink-0">
                <Calculator size={20} className="text-gold" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Not sure how many calories you need?</p>
                <p className="text-gray-500 text-xs mt-0.5">Try our free calorie calculator. Get your daily target in 30 seconds.</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-3 transition-all flex-shrink-0 whitespace-nowrap">
              Calculate Now <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </a>

      {/* ── EDUCATIONAL HUB ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
              The <span className="text-accent">NutriGo</span> Hub
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Articles */}
            <div className="bg-surface rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200" alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-1">
                    <BookOpen size={17} className="text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Articles & Blogs</h3>
                  <p className="text-xs text-gray-400">Expert tips on nutrition, workouts, mindfulness and healthy living.</p>
                </div>
              </div>
              <div className="space-y-3 mb-5">
                {featuredArticles.map(a => (
                  <Link key={a.id} to={`/articles/${a.slug}`} className="block group">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-accent transition-colors line-clamp-2 leading-snug">{a.title}</p>
                  </Link>
                ))}
              </div>
              <Link to="/articles" className="inline-flex items-center gap-1 text-sm text-accent font-medium hover:text-accent-dark">
                Read Articles <ChevronRight size={14} />
              </Link>
            </div>

            {/* Podcast */}
            <div className="bg-surface rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Headphones size={20} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Podcasts & Videos</h3>
                  <p className="text-xs text-gray-400">Listen to expert talks, success stories and nutrition insights.</p>
                </div>
              </div>
              <div className="relative rounded-xl overflow-hidden mb-5 bg-gray-100 h-32">
                <img src="https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400" alt="" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center shadow-lg">
                    <Play size={18} className="text-white ml-0.5" />
                  </div>
                </div>
              </div>
              <Link to="/podcast" className="inline-flex items-center gap-1 text-sm text-purple-600 font-medium hover:text-purple-700">
                Listen Now <ChevronRight size={14} />
              </Link>
            </div>

            {/* Events */}
            <div className="bg-surface rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <CalendarDays size={20} className="text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Events & Workshops</h3>
                  <p className="text-xs text-gray-400">Join workshops, cooking classes, fitness challenges and community events.</p>
                </div>
              </div>
              <div className="relative rounded-xl overflow-hidden mb-5 h-32">
                <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400" alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white">
                  <p className="text-xs font-medium">Next: May 18 · Cooking Class</p>
                </div>
              </div>
              <Link to="/events" className="inline-flex items-center gap-1 text-sm text-orange-500 font-medium hover:text-orange-600">
                Explore Events <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
              What Our <span className="text-accent">Customers</span> Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white font-bold`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-accent text-xs font-medium">{t.goal}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALORIE CALCULATOR ── */}
      <section id="calorie-calculator" className="py-20 bg-white scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-gold/10 text-gold border border-gold/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <Calculator size={14} /> Free Tool
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
              Calorie <span className="text-accent">Calculator</span>
            </h2>
            <p className="text-gray-400 mt-3">Find your daily calorie needs and get a plan recommendation.</p>
          </div>

          <div className="bg-surface rounded-3xl border border-gray-100 shadow-sm p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              {/* Age */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Age</label>
                <input
                  type="number" min="10" max="110"
                  value={calc.age} onChange={e => setCalc(c => ({ ...c, age: e.target.value }))}
                  placeholder="e.g. 28"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-gold"
                />
              </div>
              {/* Gender */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Gender</label>
                <div className="flex gap-2">
                  {(['male', 'female'] as const).map(g => (
                    <button key={g} type="button" onClick={() => setCalc(c => ({ ...c, gender: g }))}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-medium capitalize transition-all cursor-pointer ${
                        calc.gender === g ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:border-primary'
                      }`}
                    >{g}</button>
                  ))}
                </div>
              </div>
              {/* Height */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Height (cm)</label>
                <input
                  type="number" min="100" max="250"
                  value={calc.height} onChange={e => setCalc(c => ({ ...c, height: e.target.value }))}
                  placeholder="e.g. 170"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-gold"
                />
              </div>
              {/* Weight */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Weight (kg)</label>
                <input
                  type="number" min="30" max="300"
                  value={calc.weight} onChange={e => setCalc(c => ({ ...c, weight: e.target.value }))}
                  placeholder="e.g. 70"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-gold"
                />
              </div>
            </div>
            {/* Activity */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Activity Level</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(activityMultipliers).map(([key, { label }]) => (
                  <button key={key} type="button" onClick={() => setCalc(c => ({ ...c, activity: key }))}
                    className={`px-3 py-2.5 rounded-xl border text-sm font-medium text-left transition-all cursor-pointer ${
                      calc.activity === key ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                    }`}
                  >{label}</button>
                ))}
              </div>
            </div>
            <button onClick={handleCalc}
              className="w-full bg-primary hover:bg-secondary text-white font-semibold py-3.5 rounded-xl transition-colors cursor-pointer"
            >
              Calculate My Calorie Needs
            </button>

            {tdee && (
              <div className="mt-6 p-6 bg-primary/5 border border-primary/20 rounded-2xl text-center">
                <p className="text-gray-500 text-sm mb-1">Your estimated daily calorie need</p>
                <p className="font-serif text-5xl font-bold text-primary mb-1">{tdee.toLocaleString()}</p>
                <p className="text-gray-400 text-sm mb-4">kcal / day</p>
                <div className="grid grid-cols-3 gap-3 text-center mb-5">
                  {[
                    { label: 'Weight Loss', cal: tdee - 500, color: 'text-accent' },
                    { label: 'Maintenance', cal: tdee, color: 'text-primary' },
                    { label: 'Muscle Gain', cal: tdee + 300, color: 'text-blue-600' },
                  ].map(g => (
                    <div key={g.label} className="bg-white rounded-xl p-3 border border-gray-100">
                      <p className={`font-bold text-lg ${g.color}`}>{g.cal.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{g.label}</p>
                    </div>
                  ))}
                </div>
                {goalFromTdee && (
                  <OrderNowButton
                    unstyled
                    className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
                    icon={<ArrowRight size={16} />}
                    iconPosition="end"
                  >
                    See Recommended {goalFromTdee === 'weight_loss' ? 'Weight Loss' : goalFromTdee === 'muscle_gain' ? 'Muscle Gain' : 'Healthy Lifestyle'} Plan
                  </OrderNowButton>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">
                Ready to start?<br />
                <span className="text-accent-light">Join NutriGo today!</span>
              </h2>
              <p className="text-white/60 mb-2">Take the first step towards a healthier, happier you.</p>
              <div className="flex items-center gap-2 mt-4">
                <ShieldCheck size={14} className="text-accent-light" />
                <span className="text-white/50 text-xs">No spam. Unsubscribe anytime.</span>
              </div>
            </div>
            <div>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input type="text" placeholder="Your Name" className="flex-1 px-4 py-3 rounded-xl bg-white text-sm outline-none text-gray-700 placeholder-gray-400" />
                <input type="email" placeholder="Your Email" className="flex-1 px-4 py-3 rounded-xl bg-white text-sm outline-none text-gray-700 placeholder-gray-400" />
              </div>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold px-7 py-3.5 rounded-xl transition-colors w-full justify-center"
              >
                Get Started <ArrowRight size={18} />
              </Link>
              <div className="flex items-center gap-3 mt-4">
                <div className="flex -space-x-2">
                  {['A','B','C','D'].map(l => (
                    <div key={l} className="w-7 h-7 rounded-full bg-white/20 border-2 border-primary flex items-center justify-center text-white text-xs font-bold">{l}</div>
                  ))}
                </div>
                <span className="text-white/50 text-xs">Join 5000+ happy customers</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
