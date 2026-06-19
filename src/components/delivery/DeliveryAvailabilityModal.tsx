import { MapPinned } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

interface DeliveryAvailabilityModalProps {
  isOpen: boolean
  title: string
  message: string
  debugDistanceKm?: number | null
  onConfirm: () => void
}

export function DeliveryAvailabilityModal({
  isOpen,
  title,
  message,
  debugDistanceKm,
  onConfirm,
}: DeliveryAvailabilityModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onConfirm} size="sm">
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-lg">
          <MapPinned size={28} />
        </div>

        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-gray-500">{message}</p>

        {import.meta.env.DEV && typeof debugDistanceKm === 'number' && (
          <div className="mt-5 rounded-2xl border border-dashed border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
            Debug distance: {debugDistanceKm.toFixed(2)} km
          </div>
        )}

        <div className="mt-7">
          <Button type="button" size="lg" fullWidth onClick={onConfirm}>
            OK
          </Button>
        </div>
      </div>
    </Modal>
  )
}
