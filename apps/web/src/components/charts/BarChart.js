/**
 * Bar Chart Component
 * 
 * A customizable bar chart component for displaying data visualizations.
 * Supports horizontal and vertical orientations, animations, and interactive features.
 * 
 * Features:
 * - Horizontal and vertical bar charts
 * - Animated transitions
 * - Interactive hover effects
 * - Customizable colors and styling
 * - Responsive design
 * - Data labels and tooltips
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';

const BarChart = ({
  data = [],
  title = '',
  orientation = 'vertical', // 'vertical' or 'horizontal'
  showValues = true,
  showGrid = true,
  animated = true,
  colorScheme = 'orange',
  height = 300,
  className = ''
}) => {
  // State
  const [animatedData, setAnimatedData] = useState([]);
  const [hoveredBar, setHoveredBar] = useState(null);

  // Refs
  const chartRef = useRef(null);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();

  // Color schemes
  const colorSchemes = {
    orange: {
      primary: '#f97316',
      secondary: '#fed7aa',
      hover: '#ea580c',
      text: '#9a3412'
    },
    blue: {
      primary: '#3b82f6',
      secondary: '#bfdbfe',
      hover: '#2563eb',
      text: '#1e40af'
    },
    green: {
      primary: '#10b981',
      secondary: '#a7f3d0',
      hover: '#059669',
      text: '#047857'
    },
    purple: {
      primary: '#8b5cf6',
      secondary: '#c4b5fd',
      hover: '#7c3aed',
      text: '#5b21b6'
    },
    red: {
      primary: '#ef4444',
      secondary: '#fecaca',
      hover: '#dc2626',
      text: '#991b1b'
    }
  };

  const colors = colorSchemes[colorScheme] || colorSchemes.orange;

  // Calculate chart dimensions and scales
  const maxValue = Math.max(...data.map(item => item.value));
  const chartPadding = 40;
  const barThickness = orientation === 'vertical' ? 40 : 30;
  const barSpacing = orientation === 'vertical' ? 20 : 15;

  // Animate data on mount
  useEffect(() => {
    if (animated) {
      // Start with zero values
      setAnimatedData(data.map(item => ({ ...item, value: 0 })));
      
      // Animate to actual values
      const timer = setTimeout(() => {
        setAnimatedData(data);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setAnimatedData(data);
    }
  }, [data, animated]);

  // Handle bar click
  const handleBarClick = (item, index) => {
    trackUserEngagement('chart', 'bar_click', 'interaction', {
      label: item.label,
      value: item.value,
      index
    });
  };

  // Handle bar hover
  const handleBarHover = (index) => {
    setHoveredBar(index);
  };

  // Handle bar leave
  const handleBarLeave = () => {
    setHoveredBar(null);
  };

  // Format value for display
  const formatValue = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  // Render vertical bar chart
  const renderVerticalChart = () => {
    const chartWidth = (barThickness + barSpacing) * animatedData.length - barSpacing + (chartPadding * 2);
    const chartHeight = height;

    return (
      <div className="overflow-x-auto">
        <svg
          ref={chartRef}
          width={Math.max(chartWidth, 300)}
          height={chartHeight}
          className="min-w-full"
        >
          {/* Grid lines */}
          {showGrid && (
            <g>
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                const y = chartHeight - chartPadding - (ratio * (chartHeight - chartPadding * 2));
                return (
                  <g key={index}>
                    <line
                      x1={chartPadding}
                      y1={y}
                      x2={chartWidth - chartPadding}
                      y2={y}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                    <text
                      x={chartPadding - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="text-xs fill-gray-500"
                    >
                      {formatValue(maxValue * ratio)}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Bars */}
          {animatedData.map((item, index) => {
            const barHeight = (item.value / maxValue) * (chartHeight - chartPadding * 2);
            const x = chartPadding + index * (barThickness + barSpacing);
            const y = chartHeight - chartPadding - barHeight;
            const isHovered = hoveredBar === index;

            return (
              <g key={index}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barThickness}
                  height={barHeight}
                  fill={isHovered ? colors.hover : colors.primary}
                  className={`cursor-pointer transition-all duration-300 ${animated ? 'animate-pulse' : ''}`}
                  onClick={() => handleBarClick(item, index)}
                  onMouseEnter={() => handleBarHover(index)}
                  onMouseLeave={handleBarLeave}
                />

                {/* Value label */}
                {showValues && item.value > 0 && (
                  <text
                    x={x + barThickness / 2}
                    y={y - 5}
                    textAnchor="middle"
                    className="text-xs font-medium fill-gray-700"
                  >
                    {formatValue(item.value)}
                  </text>
                )}

                {/* Category label */}
                <text
                  x={x + barThickness / 2}
                  y={chartHeight - chartPadding + 15}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {item.label}
                </text>

                {/* Hover tooltip */}
                {isHovered && (
                  <g>
                    <rect
                      x={x + barThickness / 2 - 30}
                      y={y - 35}
                      width="60"
                      height="25"
                      fill="rgba(0, 0, 0, 0.8)"
                      rx="4"
                    />
                    <text
                      x={x + barThickness / 2}
                      y={y - 18}
                      textAnchor="middle"
                      className="text-xs fill-white font-medium"
                    >
                      {item.value}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // Render horizontal bar chart
  const renderHorizontalChart = () => {
    const chartWidth = 400;
    const chartHeight = (barThickness + barSpacing) * animatedData.length - barSpacing + (chartPadding * 2);

    return (
      <svg
        ref={chartRef}
        width={chartWidth}
        height={Math.max(chartHeight, 200)}
        className="w-full"
      >
        {/* Grid lines */}
        {showGrid && (
          <g>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const x = chartPadding + (ratio * (chartWidth - chartPadding * 2));
              return (
                <g key={index}>
                  <line
                    x1={x}
                    y1={chartPadding}
                    x2={x}
                    y2={chartHeight - chartPadding}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={chartHeight - chartPadding + 15}
                    textAnchor="middle"
                    className="text-xs fill-gray-500"
                  >
                    {formatValue(maxValue * ratio)}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Bars */}
        {animatedData.map((item, index) => {
          const barWidth = (item.value / maxValue) * (chartWidth - chartPadding * 2);
          const x = chartPadding;
          const y = chartPadding + index * (barThickness + barSpacing);
          const isHovered = hoveredBar === index;

          return (
            <g key={index}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barThickness}
                fill={isHovered ? colors.hover : colors.primary}
                className={`cursor-pointer transition-all duration-300 ${animated ? 'animate-pulse' : ''}`}
                onClick={() => handleBarClick(item, index)}
                onMouseEnter={() => handleBarHover(index)}
                onMouseLeave={handleBarLeave}
              />

              {/* Value label */}
              {showValues && item.value > 0 && (
                <text
                  x={x + barWidth + 5}
                  y={y + barThickness / 2 + 4}
                  className="text-xs font-medium fill-gray-700"
                >
                  {formatValue(item.value)}
                </text>
              )}

              {/* Category label */}
              <text
                x={x - 10}
                y={y + barThickness / 2 + 4}
                textAnchor="end"
                className="text-xs fill-gray-600"
              >
                {item.label}
              </text>

              {/* Hover tooltip */}
              {isHovered && (
                <g>
                  <rect
                    x={x + barWidth / 2 - 30}
                    y={y - 30}
                    width="60"
                    height="25"
                    fill="rgba(0, 0, 0, 0.8)"
                    rx="4"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 13}
                    textAnchor="middle"
                    className="text-xs fill-white font-medium"
                  >
                    {item.value}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  if (!data || data.length === 0) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <div className="text-gray-500">
          <p className="text-lg font-medium mb-2">No Data Available</p>
          <p className="text-sm">No data to display in the chart</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      {/* Title */}
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {title}
        </h3>
      )}

      {/* Chart */}
      <div className="relative">
        {orientation === 'vertical' ? renderVerticalChart() : renderHorizontalChart()}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded"
            style={{ backgroundColor: colors.primary }}
          />
          <span>Data Values</span>
        </div>
        {hoveredBar !== null && (
          <div className="text-xs text-gray-500">
            Click bars for more details
          </div>
        )}
      </div>
    </Card>
  );
};

export default BarChart;
