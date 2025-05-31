/**
 * Restaurant Bookings Management Page
 * 
 * Comprehensive booking management system for restaurant owners.
 * Allows viewing, managing, and responding to customer reservations.
 * 
 * Features:
 * - Booking list with filtering and search
 * - Booking status management
 * - Customer communication
 * - Calendar view integration
 * - Booking analytics
 * - Export capabilities
 * 
 * Next.js 15 Compatible:
 * - Uses getStaticPaths and getStaticProps
 * - Default export only
 * - JavaScript (.js) file
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  Check,
  X,
  AlertCircle,
  Search,
  Download,
  Plus
} from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext.js'

export default function RestaurantBookingsPage({ country }) {
  const { isAuthenticated } = useAuth()
  const [bookingsData, setBookingsData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('today')

  useEffect(() => {
    const fetchBookingsData = async () => {
      try {
        setIsLoading(true)
        // TODO: Replace with actual API call
        const mockData = {
          summary: {
            totalBookings: 45,
            confirmedBookings: 32,
            pendingBookings: 8,
            cancelledBookings: 5,
            totalGuests: 156,
            avgPartySize: 3.5
          },
          bookings: [
            {
              id: 1,
              customerName: 'Sarah Chen',
              email: 'sarah.chen@email.com',
              phone: '+1 (555) 123-4567',
              date: '2024-01-15',
              time: '19:30',
              guests: 2,
              status: 'confirmed',
              specialRequests: 'Window table preferred',
              createdAt: '2024-01-10T10:30:00Z'
            },
            {
              id: 2,
              customerName: 'Mike Rodriguez',
              email: 'mike.r@email.com',
              phone: '+1 (555) 234-5678',
              date: '2024-01-15',
              time: '20:00',
              guests: 4,
              status: 'pending',
              specialRequests: 'Birthday celebration - need high chair',
              createdAt: '2024-01-12T14:15:00Z'
            },
            {
              id: 3,
              customerName: 'Emily Johnson',
              email: 'emily.johnson@email.com',
              phone: '+1 (555) 345-6789',
              date: '2024-01-15',
              time: '20:30',
              guests: 6,
              status: 'confirmed',
              specialRequests: 'Vegetarian options needed',
              createdAt: '2024-01-11T16:45:00Z'
            },
            {
              id: 4,
              customerName: 'David Kim',
              email: 'david.kim@email.com',
              phone: '+1 (555) 456-7890',
              date: '2024-01-14',
              time: '18:00',
              guests: 3,
              status: 'cancelled',
              specialRequests: '',
              createdAt: '2024-01-08T09:20:00Z'
            },
            {
              id: 5,
              customerName: 'Lisa Wang',
              email: 'lisa.wang@email.com',
              phone: '+1 (555) 567-8901',
              date: '2024-01-16',
              time: '19:00',
              guests: 2,
              status: 'pending',
              specialRequests: 'Anniversary dinner',
              createdAt: '2024-01-13T11:30:00Z'
            }
          ]
        }
        
        setTimeout(() => {
          setBookingsData(mockData)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Error fetching bookings data:', error)
        setIsLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchBookingsData()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, dateFilter])

  const filteredBookings = bookingsData?.bookings.filter(booking => {
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.phone.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    return matchesSearch && matchesStatus
  }) || []

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      // TODO: Implement actual API call
      console.log('Updating booking status:', bookingId, newStatus)
      
      // Update local state
      setBookingsData(prev => ({
        ...prev,
        bookings: prev.bookings.map(booking =>
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        )
      }))
    } catch (error) {
      console.error('Error updating booking status:', error)
      alert('Failed to update booking status. Please try again.')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <Check className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'cancelled':
        return <X className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-orange-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
            Restaurant Owner Access Required
          </h3>
          <p className="text-orange-600 dark:text-orange-400 mb-4">
            Sign in with your restaurant owner account to manage bookings.
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
          <p className="text-orange-600 dark:text-orange-400">Loading bookings...</p>
        </div>
      </div>
    )
  }

  if (!bookingsData) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-orange-300 mx-auto mb-4" />
          <p className="text-orange-600 dark:text-orange-400">Unable to load bookings data</p>
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
                  Booking Management
                </h1>
                <p className="text-orange-600 dark:text-orange-400 mt-1">
                  Manage customer reservations and bookings
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              
              <button className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Add Booking
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Total Bookings</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {bookingsData.summary.totalBookings}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">
                  {bookingsData.summary.confirmedBookings}
                </p>
              </div>
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {bookingsData.summary.pendingBookings}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Total Guests</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {bookingsData.summary.totalGuests}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by customer name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-orange-200 rounded-lg bg-white text-orange-700 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-300"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-orange-200 rounded-lg bg-white text-orange-700 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-300"
              >
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                        {booking.customerName}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1 capitalize">{booking.status}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-orange-600 dark:text-orange-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="text-sm">{new Date(booking.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-orange-600 dark:text-orange-400">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="text-sm">{booking.time}</span>
                      </div>
                      <div className="flex items-center text-orange-600 dark:text-orange-400">
                        <Users className="w-4 h-4 mr-2" />
                        <span className="text-sm">{booking.guests} guests</span>
                      </div>
                      <div className="flex items-center text-orange-600 dark:text-orange-400">
                        <Phone className="w-4 h-4 mr-2" />
                        <span className="text-sm">{booking.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center text-orange-600 dark:text-orange-400 mb-3">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="text-sm">{booking.email}</span>
                    </div>

                    {booking.specialRequests && (
                      <div className="bg-orange-50 dark:bg-orange-800 rounded-lg p-3 mb-4">
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                          <strong>Special Requests:</strong> {booking.specialRequests}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(booking.id, 'confirmed')}
                          className="flex items-center px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-300"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Confirm
                        </button>
                        <button
                          onClick={() => handleStatusChange(booking.id, 'cancelled')}
                          className="flex items-center px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-300"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </button>
                      </>
                    )}

                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusChange(booking.id, 'cancelled')}
                        className="flex items-center px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-300"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </button>
                    )}

                    <a
                      href={`tel:${booking.phone}`}
                      className="flex items-center px-3 py-1 text-sm bg-orange-100 hover:bg-orange-200 text-orange-700 rounded transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300"
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </a>

                    <a
                      href={`mailto:${booking.email}`}
                      className="flex items-center px-3 py-1 text-sm bg-orange-100 hover:bg-orange-200 text-orange-700 rounded transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300"
                    >
                      <Mail className="w-3 h-3 mr-1" />
                      Email
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-8 text-center">
            <Calendar className="w-12 h-12 text-orange-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-orange-900 dark:text-orange-100 mb-2">
              No Bookings Found
            </h3>
            <p className="text-orange-600 dark:text-orange-400 mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No bookings for the selected time period.'
              }
            </p>
          </div>
        )}
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
