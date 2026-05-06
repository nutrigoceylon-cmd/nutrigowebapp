import { Leaf, Heart, Award, Users } from 'lucide-react'

const values = [
  { icon: '🌿', title: 'Transparency', desc: 'Full ingredient lists, honest nutrition facts, no hidden additives. You deserve to know exactly what you\'re eating.' },
  { icon: '🔬', title: 'Science-First', desc: 'Every plan is grounded in peer-reviewed nutritional science, not fad diets or marketing hype.' },
  { icon: '🌎', title: 'Sustainability', desc: 'Eco-friendly packaging, local sourcing where possible, and a commitment to reducing our environmental footprint.' },
  { icon: '💚', title: 'Accessibility', desc: 'We believe good nutrition shouldn\'t be a luxury. We work to keep our plans affordable without compromising quality.' },
]

const team = [
  { name: 'Dr. Sarah Mitchell', role: 'Chief Nutritionist & Co-founder', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', bio: 'RD, PhD in Nutritional Sciences from Stanford. 12 years clinical experience in metabolic health and sports nutrition.' },
  { name: 'James Chen', role: 'Head of Nutrition & Wellness', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400', bio: 'Certified Nutritionist and behavioral change specialist. Expert in sustainable habit formation and plant-based nutrition.' },
  { name: 'Chef Marco Rivera', role: 'Executive Chef', avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400', bio: 'Classically trained chef with 15 years experience in fine dining and health-focused cuisine across Europe and North America.' },
  { name: 'Lisa Park', role: 'Head of Operations & Co-founder', avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400', bio: 'Former logistics executive who built NutriGo\'s delivery infrastructure. Passionate about making healthy eating seamless.' },
]

const stats = [
  { value: '1,200+', label: 'Happy Customers', icon: Users },
  { value: '50,000+', label: 'Meals Delivered', icon: Leaf },
  { value: '98%', label: 'Satisfaction Rate', icon: Heart },
  { value: '4', label: 'Industry Awards', icon: Award },
]

export function About() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1600" alt="" className="w-full h-full object-cover opacity-10" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-4">Our Story</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-6">
            Nutrition That Works for Real Life
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            NutriGo was founded in 2021 by a nutritionist and a logistics expert who shared a frustration: healthy eating shouldn't require a culinary degree and four free hours a day.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-3">Our Mission</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-6">
                Making Science-Backed Nutrition Effortless
              </h2>
              <p className="text-gray-600 leading-relaxed mb-5">
                We started with a simple belief: everyone deserves access to meals that are both genuinely nutritious and genuinely delicious. Not one or the other. Both.
              </p>
              <p className="text-gray-600 leading-relaxed mb-5">
                Our team of Registered Dietitians, chefs, and wellness coaches collaborate to design plans that meet you where you are — whether you're an elite athlete optimizing performance or someone just starting their wellness journey.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Every recipe goes through multiple rounds of nutritional analysis, taste testing, and refinement before it reaches your door. We're obsessed with the details so you don't have to be.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map(({ value, label, icon: Icon }) => (
                <div key={label} className="bg-light-olive/50 rounded-2xl p-6 text-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <p className="font-serif text-3xl font-bold text-primary">{value}</p>
                  <p className="text-gray-500 text-sm mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why NutriGo */}
      <section className="py-20 bg-light-olive/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-2">Why Us</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary">What Sets Us Apart</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Clinical Expertise, Not Guesswork', desc: 'Our nutritionists hold advanced degrees and clinical credentials. Plans are based on evidence, not trends. Each macro target is calculated for your specific goal, body type, and activity level.', icon: '🎓' },
              { title: 'Restaurant-Quality Meals', desc: 'Chef Marco and his team bring fine-dining techniques to everyday nutrition. We believe that healthy food should excite you, not bore you. Expect bold flavors, beautiful presentations, and varied cuisines.', icon: '👨‍🍳' },
              { title: 'Full Supply Chain Control', desc: 'We source, prepare, and deliver everything ourselves. No middlemen means we can guarantee freshness, maintain allergen protocols, and respond instantly to issues.', icon: '🔗' },
              { title: 'Data-Driven Progress Tracking', desc: 'Your dashboard gives you a complete picture of your nutrition journey — calories, macros, weight trends, and workout logs — so you can see what\'s working and make informed adjustments.', icon: '📊' },
            ].map(item => (
              <div key={item.title} className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm flex gap-5">
                <div className="text-3xl flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-semibold text-primary text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-2">Our Values</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary">What We Stand For</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(v => (
              <div key={v.title} className="text-center p-6">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="font-semibold text-primary text-lg mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-2">Our Team</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">The Experts Behind NutriGo</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map(member => (
              <div key={member.name} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-colors">
                <img src={member.avatar} alt={member.name} className="w-full h-52 object-cover" />
                <div className="p-5">
                  <h3 className="font-semibold text-white">{member.name}</h3>
                  <p className="text-gold text-xs font-medium mb-3">{member.role}</p>
                  <p className="text-white/50 text-xs leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
