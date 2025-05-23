/**
 * Simple Chart Component
 * 
 * Basic chart visualization for analytics and data display.
 */

import React from 'react';
import { Card } from '../ui/index.js';

const SimpleChart = ({
  data = [],
  type = 'bar', // 'bar', 'line', 'pie'
  title,
  height = 200,
  className = ''
}) => {
  const maxValue = Math.max(...data.map(d => d.value));

  const renderBarChart = () => (
    <div className="flex items-end justify-between h-full gap-2">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <div
            className="bg-orange-500 rounded-t w-full transition-all duration-300 hover:bg-orange-600"
            style={{
              height: `${(item.value / maxValue) * 80}%`,
              minHeight: '4px'
            }}
          />
          <span className="text-xs text-gray-600 mt-2 text-center">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <Card className={`p-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div style={{ height: `${height}px` }}>
        {type === 'bar' && renderBarChart()}
      </div>
    </Card>
  );
};

export default SimpleChart;
