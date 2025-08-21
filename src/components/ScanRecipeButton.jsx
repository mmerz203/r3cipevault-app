import React, { useState, useRef } from 'react';

const ScanRecipeButton = ({ onImageCapture, disabled = false, className = '' }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef(null);

  const handleCameraClick = () => {
    // For web browsers, we'll use file input with camera capture
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setIsCapturing(true);
      
      // Create a preview URL for the image
      const imageUrl = URL.createObjectURL(file);
      
      // Call the callback with the file and preview URL
      onImageCapture({
        file,
        previewUrl: imageUrl,
        fileName: file.name
      });
      
      setIsCapturing(false);
      
      // Reset the file input
      event.target.value = '';
    }
  };

  return (
    <>
      <button
        onClick={handleCameraClick}
        disabled={disabled || isCapturing}
        className={`
          flex items-center justify-center space-x-2 
          bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 
          text-white font-medium px-4 py-3 rounded-lg 
          transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${className}
        `}
      >
        {isCapturing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
            <span>Scan Recipe</span>
          </>
        )}
      </button>

      {/* Hidden file input for camera/photo capture */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment" // Prefer rear camera on mobile devices
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
};

export default ScanRecipeButton;
