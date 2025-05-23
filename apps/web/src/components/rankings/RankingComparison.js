/**
 * Ranking Comparison Component
 * 
 * Allows users to compare rankings across different entities.
 * Shows side-by-side comparison with detailed metrics.
 * 
 * Features:
 * - Multi-entity comparison
 * - Visual comparison charts
 * - Detailed metrics breakdown
 * - Export comparison data
 * - Share comparison results
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link.js';
import { Card, Badge, Button, LoadingSpinner } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useCountry } from '../../hooks/useCountry.js';
import { analyticsService } from '../../services/analyticsService.js';

const RankingComparison = ({
  entityType = 'dish', // 'dish', 'restaurant', 'user'
  entityIds = [],
  comparisonMetrics = ['overall', 'popularity', 'recent'],
  showCharts = true,
  showExport = true,
  showShare = true,
  maxEntities = 4,
  className = ''
}) => {
  // State
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('overall');

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { country } = useCountry();

  // Metric configurations
  const metricConfigs = {
    overall: {
      label: 'Overall Ranking',
      description: 'Combined ranking across all factors',
      icon: '🏆',
      color: 'text-orange-600'
    },
    popularity: {
      label: 'Popularity',
      description: 'Based on views, votes, and engagement',
      icon: '🔥',
      color: 'text-red-600'
    },
    recent: {
      label: 'Recent Performance',
      description: 'Rankings from the last 30 days',
      icon: '📈',
      color: 'text-blue-600'
    },
    quality: {
      label: 'Quality Score',
      description: 'Based on ratings and reviews',
      icon: '⭐',
      color: 'text-yellow-600'
    },
    consistency: {
      label: 'Consistency',
      description: 'Stability of rankings over time',
      icon: '📊',
      color: 'text-green-600'
    }
  };

  // Fetch comparison data
  const fetchComparisonData = async () => {
    if (entityIds.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getRankingComparison({
        entityType,
        entityIds: entityIds.slice(0, maxEntities),
        metrics: comparisonMetrics,
        includeCharts: showCharts
      });

      setComparisonData(data);
      
      // Track comparison view
      trackUserEngagement('rankings', 'comparison', 'view', {
        entityType,
        entityIds: entityIds.slice(0, maxEntities),
        metrics: comparisonMetrics
      });
    } catch (err) {
      console.error('Error fetching comparison data:', err);
      setError(err.message || 'Failed to load comparison data');
    } finally {
      setLoading(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const exportData = await analyticsService.exportRankingComparison({
        entityType,
        entityIds,
        metrics: comparisonMetrics,
        format: 'csv'
      });

      // Create download link
      const blob = new Blob([exportData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ranking-comparison-${entityType}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      trackUserEngagement('rankings', 'comparison', 'export', {
        entityType,
        entityCount: entityIds.length
      });
    } catch (err) {
      console.error('Error exporting comparison:', err);
    }
  };

  // Handle share
  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/${country}/rankings/compare?type=${entityType}&ids=${entityIds.join(',')}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Ranking Comparison',
          text: `Compare ${entityType} rankings on Bellyfed`,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Comparison link copied to clipboard!');
      }

      trackUserEngagement('rankings', 'comparison', 'share', {
        entityType,
        entityCount: entityIds.length,
        shareMethod: navigator.share ? 'native' : 'clipboard'
      });
    } catch (err) {
      console.error('Error sharing comparison:', err);
    }
  };

  // Get best performer for metric
  const getBestPerformer = (metric) => {
    if (comparisonData.length === 0) return null;
    
    return comparisonData.reduce((best, current) => {
      const currentValue = current.metrics[metric]?.value || 0;
      const bestValue = best.metrics[metric]?.value || 0;
      return currentValue > bestValue ? current : best;
    });
  };

  // Get metric value display
  const getMetricDisplay = (entity, metric) => {
    const metricData = entity.metrics[metric];
    if (!metricData) return 'N/A';

    const { value, rank, trend } = metricData;
    return {
      value: value.toFixed(1),
      rank: rank ? `#${rank}` : null,
      trend: trend ? (trend > 0 ? '↗' : trend < 0 ? '↘' : '→') : null,
      trendColor: trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
    };
  };

  // Load data on mount
  useEffect(() => {
    fetchComparisonData();
  }, [entityIds, comparisonMetrics]);

  if (loading) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="text-red-600">
          <p className="text-lg font-semibold mb-2">Error Loading Comparison</p>
          <p className="text-sm">{error}</p>
          <Button 
            onClick={fetchComparisonData} 
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (comparisonData.length === 0) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="text-gray-500">
          <p className="text-lg font-medium mb-2">No Comparison Data</p>
          <p className="text-sm">
            Add entities to compare their rankings.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            📊 Ranking Comparison
          </h2>
          <p className="text-gray-600 mt-1">
            Comparing {comparisonData.length} {entityType}{comparisonData.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-3">
          {showExport && (
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
            >
              Export Data
            </Button>
          )}
          {showShare && (
            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
            >
              Share Comparison
            </Button>
          )}
        </div>
      </div>

      {/* Metric Selector */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {comparisonMetrics.map(metric => {
            const config = metricConfigs[metric];
            if (!config) return null;

            return (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${selectedMetric === metric
                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <span>{config.icon}</span>
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Comparison Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
                </th>
                {comparisonMetrics.map(metric => {
                  const config = metricConfigs[metric];
                  return config && (
                    <th key={metric} className="text-center py-3 px-4 font-medium text-gray-900">
                      <div className="flex items-center justify-center gap-1">
                        <span>{config.icon}</span>
                        <span>{config.label}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((entity, index) => (
                <tr key={entity.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {entity.imageUrl && (
                        <img
                          src={entity.imageUrl}
                          alt={entity.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <Link href={`/${country}/${entityType}s/${entity.id}`}>
                          <h3 className="font-medium text-gray-900 hover:text-orange-600 cursor-pointer">
                            {entity.name}
                          </h3>
                        </Link>
                        {entity.subtitle && (
                          <p className="text-sm text-gray-600">{entity.subtitle}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  {comparisonMetrics.map(metric => {
                    const display = getMetricDisplay(entity, metric);
                    const bestPerformer = getBestPerformer(metric);
                    const isBest = bestPerformer && bestPerformer.id === entity.id;

                    return (
                      <td key={metric} className="py-4 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className={`text-lg font-bold ${isBest ? 'text-green-600' : 'text-gray-900'}`}>
                            {display.value}
                            {isBest && <span className="ml-1">👑</span>}
                          </div>
                          {display.rank && (
                            <Badge variant="outline" className="text-xs">
                              {display.rank}
                            </Badge>
                          )}
                          {display.trend && (
                            <span className={`text-xs ${display.trendColor}`}>
                              {display.trend}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Selected Metric Details */}
      {selectedMetric && metricConfigs[selectedMetric] && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{metricConfigs[selectedMetric].icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {metricConfigs[selectedMetric].label}
              </h3>
              <p className="text-sm text-gray-600">
                {metricConfigs[selectedMetric].description}
              </p>
            </div>
          </div>

          {/* Metric Visualization */}
          <div className="space-y-4">
            {comparisonData.map((entity) => {
              const display = getMetricDisplay(entity, selectedMetric);
              const maxValue = Math.max(...comparisonData.map(e => e.metrics[selectedMetric]?.value || 0));
              const percentage = maxValue > 0 ? (entity.metrics[selectedMetric]?.value || 0) / maxValue * 100 : 0;

              return (
                <div key={entity.id} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium text-gray-900 truncate">
                    {entity.name}
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-orange-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <span className="text-sm font-bold text-gray-900">
                      {display.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Comparison Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {comparisonMetrics.map(metric => {
            const config = metricConfigs[metric];
            const bestPerformer = getBestPerformer(metric);
            
            return config && bestPerformer && (
              <div key={metric} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{config.icon}</span>
                  <h4 className="font-medium text-gray-900">{config.label}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Best: <span className="font-medium">{bestPerformer.name}</span>
                </p>
                <p className="text-lg font-bold text-green-600">
                  {getMetricDisplay(bestPerformer, metric).value}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default RankingComparison;
