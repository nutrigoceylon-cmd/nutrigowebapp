import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin } from 'lucide-react'
import { BrandLogo } from './BrandLogo'

const socialLinks = [
  { label: 'f', title: 'Facebook', href: 'https://web.facebook.com/profile.php?id=61590527923244' },
  { label: '📷', title: 'Instagram', href: 'https://www.instagram.com/nutrigoceylon/' },
  { label: '♪', title: 'TikTok', href: 'https://www.tiktok.com/@nutrigoceylon?is_from_webapp=1&sender_device=pc' },
]

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center mb-4 rounded-2xl bg-white px-4 py-3 shadow-sm">
              <BrandLogo imageClassName="h-12 w-auto" />
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-xs">
              Scientifically balanced meals, delivered fresh to your door. Helping you achieve your health goals every day.
            </p>
            <div className="flex gap-2.5">
              {socialLinks.map(s => (
                <a
                  key={s.title}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.title}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-accent transition-colors flex items-center justify-center text-white/70 hover:text-white text-xs font-bold"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-sm text-white mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/about', label: 'About Us' },
                { to: '/menu', label: 'Our Menu' },
                { to: '/articles', label: 'Articles' },
                { to: '/podcast', label: 'Podcast' },
                { to: '/events', label: 'Events' },
                { to: '/faq', label: 'FAQ' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-white/50 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm text-white mb-4">Support</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/contact', label: 'Contact Us' },
                { to: '/faq', label: 'Delivery & Areas' },
                { to: '/faq', label: 'Returns & Refunds' },
                { to: '/faq', label: 'Terms & Conditions' },
                { to: '/faq', label: 'Privacy Policy' },
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.to} className="text-white/50 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account + Contact */}
          <div>
            <h4 className="font-semibold text-sm text-white mb-4">Account</h4>
            <ul className="space-y-2.5 mb-6">
              {[
                { to: '/dashboard', label: 'My Account' },
                { to: '/menu', label: 'My Plans' },
                { to: '/dashboard', label: 'My Orders' },
                { to: '/dashboard', label: 'Track Progress' },
                { to: '/login', label: 'Logout' },
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.to} className="text-white/50 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="font-semibold text-sm text-white mb-3">Contact Us</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/50 text-sm min-w-0">
                <Phone size={13} className="text-accent-light flex-shrink-0" />
                <span className="break-all">+94 77 123 4567</span>
              </div>
              <div className="flex items-center gap-2 text-white/50 text-sm min-w-0">
                <Mail size={13} className="text-accent-light flex-shrink-0" />
                <span className="break-all">hello@nutrigo.lk</span>
              </div>
              <div className="flex items-center gap-2 text-white/50 text-sm min-w-0">
                <MapPin size={13} className="text-accent-light flex-shrink-0" />
                <span className="break-all">Colombo, Sri Lanka</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-white/30 text-sm">© 2026 NutriGo (Pvt) Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
