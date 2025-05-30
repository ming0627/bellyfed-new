import React, { useState, useCallback, useRef } from 'react';
import { Crop, RotateCw, ZoomIn, ZoomOut, Check, X } from 'lucide-react';

/**
 * Profile Image Cropper Component
 * 
 * Provides image cropping functionality for profile avatars with zoom,
 * rotation, and positioning controls. Creates a circular crop area
 * optimized for avatar images.
 * 
 * @param {Object} props - Component props
 * @param {string} props.imageUrl - URL of the image to crop
 * @param {Function} props.onCrop - Callback when cropping is complete
 * @param {Function} props.onCancel - Callback when cropping is cancelled
 * @param {number} props.cropSize - Size of the crop area in pixels
 * @param {string} props.className - Additional CSS classes
 */
export default function ProfileImageCropper({
  imageUrl,
  onCrop,
  onCancel,
  cropSize = 200,
  className = ''
}) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Handle image load
   */
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    // Center the image initially
    if (imageRef.current) {
      const img = imageRef.current;
      const containerWidth = cropSize * 2;
      const containerHeight = cropSize * 2;
      
      setCrop(prev => ({
        ...prev,
        x: (containerWidth - img.naturalWidth) / 2,
        y: (containerHeight - img.naturalHeight) / 2
      }));
    }
  }, [cropSize]);

  /**
   * Handle mouse down for dragging
   */
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - crop.x,
      y: e.clientY - crop.y
    });
  }, [crop.x, crop.y]);

  /**
   * Handle mouse move for dragging
   */
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    setCrop(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }));
  }, [isDragging, dragStart]);

  /**
   * Handle mouse up to stop dragging
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  /**
   * Handle zoom change
   */
  const handleZoomChange = useCallback((delta) => {
    setCrop(prev => ({
      ...prev,
      scale: Math.max(0.1, Math.min(3, prev.scale + delta))
    }));
  }, []);

  /**
   * Handle rotation change
   */
  const handleRotationChange = useCallback(() => {
    setCrop(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360
    }));
  }, []);

  /**
   * Reset crop to default values
   */
  const handleReset = useCallback(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      const containerWidth = cropSize * 2;
      const containerHeight = cropSize * 2;
      
      setCrop({
        x: (containerWidth - img.naturalWidth) / 2,
        y: (containerHeight - img.naturalHeight) / 2,
        scale: 1,
        rotation: 0
      });
    }
  }, [cropSize]);

  /**
   * Process the crop and return the result
   */
  const handleCropComplete = useCallback(async () => {
    if (!imageRef.current || !canvasRef.current) return;

    setIsProcessing(true);
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;

      // Set canvas size to crop size
      canvas.width = cropSize;
      canvas.height = cropSize;

      // Clear canvas
      ctx.clearRect(0, 0, cropSize, cropSize);

      // Create circular clipping path
      ctx.save();
      ctx.beginPath();
      ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, Math.PI * 2);
      ctx.clip();

      // Calculate the crop area
      const centerX = cropSize;
      const centerY = cropSize;
      const cropX = centerX - crop.x;
      const cropY = centerY - crop.y;

      // Apply transformations
      ctx.translate(cropSize / 2, cropSize / 2);
      ctx.rotate((crop.rotation * Math.PI) / 180);
      ctx.scale(crop.scale, crop.scale);
      ctx.translate(-cropSize / 2, -cropSize / 2);

      // Draw the image
      ctx.drawImage(
        img,
        cropX / crop.scale,
        cropY / crop.scale,
        cropSize / crop.scale,
        cropSize / crop.scale,
        0,
        0,
        cropSize,
        cropSize
      );

      ctx.restore();

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob && onCrop) {
          onCrop(blob);
        }
      }, 'image/jpeg', 0.9);

    } catch (error) {
      console.error('Error processing crop:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [crop, cropSize, onCrop]);

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Crop Profile Image
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Crop Area */}
      <div className="relative mb-6">
        <div 
          className="relative mx-auto border-2 border-dashed border-gray-300 rounded-full overflow-hidden bg-gray-50"
          style={{ width: cropSize * 2, height: cropSize * 2 }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Crop Circle Overlay */}
          <div 
            className="absolute border-2 border-orange-500 rounded-full pointer-events-none z-10"
            style={{
              width: cropSize,
              height: cropSize,
              left: cropSize / 2,
              top: cropSize / 2,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
            }}
          />

          {/* Image */}
          {imageUrl && (
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Crop preview"
              className="absolute cursor-move select-none"
              style={{
                left: crop.x,
                top: crop.y,
                transform: `scale(${crop.scale}) rotate(${crop.rotation}deg)`,
                transformOrigin: 'center'
              }}
              onLoad={handleImageLoad}
              onMouseDown={handleMouseDown}
              draggable={false}
            />
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Zoom Controls */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => handleZoomChange(-0.1)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={crop.scale <= 0.1}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600 min-w-16 text-center">
            {Math.round(crop.scale * 100)}%
          </span>
          <button
            onClick={() => handleZoomChange(0.1)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={crop.scale >= 3}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Rotation and Reset */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={handleRotationChange}
            className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Rotate
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCropComplete}
            disabled={!imageLoaded || isProcessing}
            className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg transition-colors"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Apply Crop
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hidden canvas for processing */}
      <canvas
        ref={canvasRef}
        className="hidden"
        width={cropSize}
        height={cropSize}
      />
    </div>
  );
}
