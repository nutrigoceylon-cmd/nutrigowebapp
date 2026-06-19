import type { ReactNode } from 'react'
import { useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  DELIVERY_SETTINGS,
  cacheSuccessfulDeliveryValidation,
  hasConfiguredDeliveryZones,
  readCachedDeliveryValidation,
  validateDeliveryLocation,
} from '../../lib/delivery'
import { DeliveryAvailabilityModal } from './DeliveryAvailabilityModal'
import { LocationPermissionModal } from './LocationPermissionModal'

type PermissionState = 'requesting' | 'denied' | 'error'

type AvailabilityState = {
  title: string
  message: string
  distanceKm?: number | null
} | null

interface OrderNowButtonProps {
  className?: string
  children?: ReactNode
  icon?: ReactNode
  iconPosition?: 'start' | 'end'
  destination?: string
  unstyled?: boolean
}

const LOCATION_ACCESS_REQUIRED = 'Location access is required to check delivery availability.'
const DEFAULT_BUTTON_CLASS_NAME = 'inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-secondary'

export function OrderNowButton({
  className = '',
  children = 'Order Now',
  icon = <ShoppingBag size={18} />,
  iconPosition = 'start',
  destination = '/menu',
  unstyled = false,
}: OrderNowButtonProps) {
  const navigate = useNavigate()
  const [permissionOpen, setPermissionOpen] = useState(false)
  const [permissionState, setPermissionState] = useState<PermissionState>('requesting')
  const [permissionMessage, setPermissionMessage] = useState<string>()
  const [availabilityState, setAvailabilityState] = useState<AvailabilityState>(null)

  function navigateToDestination() {
    navigate(destination)
  }

  function resetPermissionState(nextState: PermissionState, message?: string) {
    setPermissionState(nextState)
    setPermissionMessage(message)
  }

  function handleOrderNowClick() {
    const cachedValidation = readCachedDeliveryValidation()
    if (cachedValidation) {
      navigateToDestination()
      return
    }

    if (!hasConfiguredDeliveryZones()) {
      setAvailabilityState({
        title: 'Delivery Validation Unavailable',
        message: 'We cannot verify delivery coverage right now. Please update the delivery zone settings and try again.',
      })
      return
    }

    setPermissionOpen(true)
    requestUserLocation()
  }

  function requestUserLocation() {
    resetPermissionState('requesting')

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resetPermissionState(
        'error',
        'Your browser does not support location access. Please use a supported device or browser and try again.'
      )
      return
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const result = validateDeliveryLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })

        if (import.meta.env.DEV) {
          console.debug('Delivery validation result', result)
        }

        if (result.isDeliverable && result.matchedZone) {
          cacheSuccessfulDeliveryValidation(result.matchedZone.id)
          setPermissionOpen(false)
          navigateToDestination()
          return
        }

        setPermissionOpen(false)
        setAvailabilityState({
          title: 'Delivery Not Available Yet',
          message: "Sorry, we don't currently deliver to your area. We're expanding soon and hope to serve you in the future.",
          distanceKm: result.distanceKm,
        })
      },
      error => {
        if (error.code === error.PERMISSION_DENIED) {
          resetPermissionState('denied', LOCATION_ACCESS_REQUIRED)
          return
        }

        resetPermissionState(
          'error',
          'We could not retrieve your current location. Please check your connection and location settings, then try again.'
        )
      },
      DELIVERY_SETTINGS.geolocationOptions
    )
  }

  function handlePermissionCancel() {
    setPermissionOpen(false)
    setPermissionMessage(undefined)
  }

  function handleUnavailableConfirm() {
    setAvailabilityState(null)
    navigate('/')
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOrderNowClick}
        className={unstyled ? className : `${DEFAULT_BUTTON_CLASS_NAME} ${className}`}
      >
        {iconPosition === 'start' && icon}
        {children}
        {iconPosition === 'end' && icon}
      </button>

      <LocationPermissionModal
        isOpen={permissionOpen}
        state={permissionState}
        message={permissionMessage}
        onRetry={requestUserLocation}
        onCancel={handlePermissionCancel}
      />

      <DeliveryAvailabilityModal
        isOpen={Boolean(availabilityState)}
        title={availabilityState?.title ?? ''}
        message={availabilityState?.message ?? ''}
        debugDistanceKm={availabilityState?.distanceKm}
        onConfirm={handleUnavailableConfirm}
      />
    </>
  )
}
