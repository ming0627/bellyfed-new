/**
 * Restaurant Menu Management Page
 * 
 * Main page for restaurant owners to manage their menu items.
 * Provides comprehensive menu management tools including CRUD operations,
 * category management, and bulk actions.
 * 
 * Features:
 * - Menu item listing and management
 * - Search and filtering capabilities
 * - Bulk operations
 * - Category management
 * - Quick actions
 * 
 * Next.js 15 Compatible:
 * - Uses getStaticPaths and getStaticProps
 * - Default export only
 * - JavaScript (.js) file
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ArrowLeft, Plus, BarChart3 } from 'lucide-react'
import { useAuth } from '../../../../contexts/AuthContext.js'
import MenuManagement from '../../../../components/restaurant-management/MenuManagement.js'

export default function RestaurantMenuPage({ country }) {
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  // Mock restaurant ID - in real app, this would come from user's restaurant ownership
  const restaurantId = '1'

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-orange-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
            Restaurant Owner Access Required
          </h3>
          <p className="text-orange-600 dark:text-orange-400 mb-4">
            Sign in with your restaurant owner account to manage your menu.
          </p>
          <Link
            href="/signin"
            className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600 dark:text-orange-400">Loading menu management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950">
      {/* Header */}
      <div className="bg-white dark:bg-orange-900 shadow-sm border-b border-orange-200 dark:border-orange-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href={`/${country}/restaurant/dashboard`}
                className="flex items-center text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-orange-200 dark:bg-orange-700"></div>
              <div>
                <h1 className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                  Menu Management
                </h1>
                <p className="text-orange-600 dark:text-orange-400 mt-1">
                  Manage your restaurant&apos;s menu items and categories
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                href={`/${country}/restaurant/analytics`}
                className="flex items-center px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Link>
              
              <Link
                href={`/${country}/restaurant/menu/add`}
                className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Menu Item
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MenuManagement restaurantId={restaurantId} country={country} />
      </div>
    </div>
  )
}

export async function getStaticPaths() {
  return {
    paths: [
      { params: { country: 'my' } },
      { params: { country: 'sg' } }
    ],
    fallback: true
  }
}

export async function getStaticProps({ params }) {
  return {
    props: {
      country: params.country
    },
    revalidate: 300 // 5 minutes
  }
}
