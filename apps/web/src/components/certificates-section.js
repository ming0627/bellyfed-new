/**
 * Certificates Section Component
 * 
 * Displays restaurant certifications, awards, and quality badges.
 * Shows various certifications like halal, organic, health ratings, etc.
 * 
 * Features:
 * - Multiple certificate types
 * - Visual badges and icons
 * - Verification status
 * - Certificate details modal
 * - Responsive grid layout
 */

import React, { useState } from 'react'
import { Card, Button, Badge } from '@bellyfed/ui'
import { useAnalyticsContext } from './analytics/AnalyticsProvider.js'

const CertificatesSection = ({
  restaurantId,
  certificates = [],
  showVerificationStatus = true,
  showDetails = true,
  maxDisplay = 6,
  className = ''
}) => {
  // State
  const [selectedCertificate, setSelectedCertificate] = useState(null)
  const [showAll, setShowAll] = useState(false)

  // Context
  const { trackUserEngagement } = useAnalyticsContext()

  // Certificate types with their icons and colors
  const certificateTypes = {
    halal: {
      name: 'Halal Certified',
      icon: '🕌',
      color: 'green',
      description: 'Certified halal by recognized Islamic authority'
    },
    organic: {
      name: 'Organic',
      icon: '🌱',
      color: 'green',
      description: 'Uses organic ingredients and sustainable practices'
    },
    health_grade: {
      name: 'Health Grade A',
      icon: '🏥',
      color: 'blue',
      description: 'Excellent health and safety standards'
    },
    hygiene: {
      name: 'Hygiene Excellence',
      icon: '✨',
      color: 'purple',
      description: 'Outstanding hygiene and cleanliness standards'
    },
    sustainable: {
      name: 'Sustainable',
      icon: '♻️',
      color: 'green',
      description: 'Committed to environmental sustainability'
    },
    local_sourcing: {
      name: 'Local Sourcing',
      icon: '🏪',
      color: 'orange',
      description: 'Sources ingredients from local suppliers'
    },
    award_winning: {
      name: 'Award Winner',
      icon: '🏆',
      color: 'yellow',
      description: 'Recognized with culinary awards'
    },
    michelin: {
      name: 'Michelin Recommended',
      icon: '⭐',
      color: 'red',
      description: 'Recommended by Michelin Guide'
    },
    covid_safe: {
      name: 'COVID-19 Safe',
      icon: '🛡️',
      color: 'blue',
      description: 'Follows COVID-19 safety protocols'
    },
    allergen_friendly: {
      name: 'Allergen Friendly',
      icon: '🚫',
      color: 'orange',
      description: 'Accommodates food allergies and dietary restrictions'
    }
  }

  // Mock certificates if none provided
  const mockCertificates = [
    {
      id: 'cert_1',
      type: 'halal',
      issuedBy: 'JAKIM',
      issuedDate: '2023-01-15',
      expiryDate: '2024-01-15',
      verified: true,
      certificateNumber: 'HAL-2023-001'
    },
    {
      id: 'cert_2',
      type: 'health_grade',
      issuedBy: 'Ministry of Health',
      issuedDate: '2023-06-01',
      expiryDate: '2024-06-01',
      verified: true,
      grade: 'A'
    },
    {
      id: 'cert_3',
      type: 'sustainable',
      issuedBy: 'Green Restaurant Association',
      issuedDate: '2023-03-10',
      expiryDate: '2025-03-10',
      verified: true,
      level: 'Gold'
    },
    {
      id: 'cert_4',
      type: 'award_winning',
      issuedBy: 'Malaysian Culinary Awards',
      issuedDate: '2023-09-20',
      verified: true,
      award: 'Best Local Cuisine 2023'
    }
  ]

  const displayCertificates = certificates.length > 0 ? certificates : mockCertificates
  const visibleCertificates = showAll ? displayCertificates : displayCertificates.slice(0, maxDisplay)

  // Handle certificate click
  const handleCertificateClick = (certificate) => {
    setSelectedCertificate(certificate)
    
    trackUserEngagement('certificate', certificate.id, 'view_details', {
      restaurantId,
      certificateType: certificate.type
    })
  }

  // Close certificate modal
  const closeCertificateModal = () => {
    setSelectedCertificate(null)
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Check if certificate is expired
  const isExpired = (expiryDate) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  if (displayCertificates.length === 0) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">
          Certifications & Awards
        </h3>
        {displayCertificates.length > maxDisplay && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `Show All (${displayCertificates.length})`}
          </Button>
        )}
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleCertificates.map((certificate) => {
          const certType = certificateTypes[certificate.type] || {
            name: certificate.type,
            icon: '📜',
            color: 'gray',
            description: 'Certificate'
          }
          
          const expired = isExpired(certificate.expiryDate)

          return (
            <Card
              key={certificate.id}
              className={`
                p-4 cursor-pointer transition-all duration-200 hover:shadow-md
                ${expired ? 'opacity-60 border-red-200' : 'hover:border-orange-300'}
              `}
              onClick={() => showDetails && handleCertificateClick(certificate)}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{certType.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                      {certType.name}
                    </h4>
                    {showVerificationStatus && (
                      <div className="flex flex-col gap-1">
                        {certificate.verified && (
                          <Badge variant="success" size="sm">
                            ✓ Verified
                          </Badge>
                        )}
                        {expired && (
                          <Badge variant="error" size="sm">
                            Expired
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {certType.description}
                  </p>
                  
                  {certificate.issuedBy && (
                    <p className="text-xs text-gray-500 mt-2">
                      Issued by {certificate.issuedBy}
                    </p>
                  )}
                  
                  {certificate.expiryDate && (
                    <p className={`text-xs mt-1 ${expired ? 'text-red-600' : 'text-gray-500'}`}>
                      {expired ? 'Expired' : 'Valid until'} {formatDate(certificate.expiryDate)}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Certificate Details Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Certificate Details
                </h2>
                <button
                  onClick={closeCertificateModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {certificateTypes[selectedCertificate.type]?.icon || '📜'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {certificateTypes[selectedCertificate.type]?.name || selectedCertificate.type}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {certificateTypes[selectedCertificate.type]?.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-200">
                  {selectedCertificate.issuedBy && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Issued By</label>
                      <p className="text-sm text-gray-900">{selectedCertificate.issuedBy}</p>
                    </div>
                  )}

                  {selectedCertificate.certificateNumber && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Certificate Number</label>
                      <p className="text-sm text-gray-900 font-mono">{selectedCertificate.certificateNumber}</p>
                    </div>
                  )}

                  {selectedCertificate.issuedDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Issued Date</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedCertificate.issuedDate)}</p>
                    </div>
                  )}

                  {selectedCertificate.expiryDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Expiry Date</label>
                      <p className={`text-sm ${isExpired(selectedCertificate.expiryDate) ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatDate(selectedCertificate.expiryDate)}
                      </p>
                    </div>
                  )}

                  {selectedCertificate.grade && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Grade</label>
                      <p className="text-sm text-gray-900">{selectedCertificate.grade}</p>
                    </div>
                  )}

                  {selectedCertificate.level && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Level</label>
                      <p className="text-sm text-gray-900">{selectedCertificate.level}</p>
                    </div>
                  )}

                  {selectedCertificate.award && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Award</label>
                      <p className="text-sm text-gray-900">{selectedCertificate.award}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    {selectedCertificate.verified && (
                      <Badge variant="success">
                        ✓ Verified
                      </Badge>
                    )}
                    {isExpired(selectedCertificate.expiryDate) && (
                      <Badge variant="error">
                        Expired
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
                <Button onClick={closeCertificateModal}>
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default CertificatesSection
