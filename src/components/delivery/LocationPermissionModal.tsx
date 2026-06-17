import { MapPin, Navigation, ShieldAlert } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

type LocationPermissionState = 'requesting' | 'denied' | 'error'

interface LocationPermissionModalProps {
  isOpen: boolean
  state: LocationPermissionState
  message?: string
  onRetry: () => void
  onCancel: () => void
}

const content = {
  requesting: {
    icon: Navigation,
    accent: 'from-primary to-accent',
    title: 'Checking Delivery Availability',
    description: 'Please allow location access so we can confirm whether delivery is available in your area.',
  },
  denied: {
    icon: ShieldAlert,
    accent: 'from-amber-500 to-orange-500',
    title: 'Location Access Needed',
    description: 'Location access is required to check delivery availability.',
  },
  error: {
    icon: MapPin,
    accent: 'from-slate-600 to-slate-800',
    title: 'We Couldn’t Read Your Location',
    description: 'Please try again to verify whether delivery is available for your address.',
  },
} as const

export function LocationPermissionModal({
  isOpen,
  state,
  message,
  onRetry,
  onCancel,
}: LocationPermissionModalProps) {
  const current = content[state]
  const Icon = current.icon

  return (
    <Modal isOpen={isOpen} onClose={onCancel} size="sm">
      <div className="text-center">
        <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${current.accent} text-white shadow-lg`}>
          {state === 'requesting' ? (
            <div className="relative flex h-7 w-7 items-center justify-center">
              <span className="absolute inset-0 rounded-full border-2 border-white/35" />
              <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
          ) : (
            <Icon size={28} />
          )}
        </div>

        <h2 className="text-2xl font-semibold text-gray-900">{current.title}</h2>
        <p className="mt-3 text-sm leading-6 text-gray-500">
          {message ?? current.description}
        </p>

        {state === 'requesting' ? (
          <div className="mt-6 rounded-2xl border border-light-green bg-light-green/40 px-4 py-3 text-sm text-primary">
            Waiting for your browser to share the current location...
          </div>
        ) : (
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button type="button" size="lg" fullWidth onClick={onRetry}>
              Try Again
            </Button>
            <Button type="button" size="lg" variant="outline" fullWidth onClick={onCancel}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
