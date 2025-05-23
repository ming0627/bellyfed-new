/**
 * Video Player Component
 * 
 * Responsive video player with controls and analytics tracking.
 */

import React, { useState, useRef } from 'react';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';

const VideoPlayer = ({
  src,
  poster,
  title,
  autoPlay = false,
  controls = true,
  muted = false,
  className = ''
}) => {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);
  const { trackUserEngagement } = useAnalyticsContext();

  const handlePlay = () => {
    setPlaying(true);
    trackUserEngagement('media', 'video_play', 'start', { title, src });
  };

  const handlePause = () => {
    setPlaying(false);
    trackUserEngagement('media', 'video_pause', 'pause', { title, src });
  };

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        controls={controls}
        muted={muted}
        onPlay={handlePlay}
        onPause={handlePause}
        className="w-full h-auto rounded-lg"
      >
        Your browser does not support the video tag.
      </video>
      {title && (
        <div className="mt-2">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
