/**
 * Legacy Social Page - Redirects to Enhanced Social Feed
 *
 * This page now redirects to the new country-based social feed
 * implemented in Phase 3 with comprehensive social features.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useCountry } from '../hooks/useCountry.js'
import { LoadingSpinner } from '@bellyfed/ui'

export default function SocialPage() {
  const router = useRouter()
  const { country } = useCountry()

  // Redirect to enhanced social feed
  useEffect(() => {
    if (country) {
      router.replace(`/${country}/social`)
    }
  }, [country, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Redirecting to enhanced social feed...</p>
      </div>
    </div>
  )
}
