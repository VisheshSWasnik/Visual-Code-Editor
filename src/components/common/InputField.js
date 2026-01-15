import React, { useRef, useEffect, useState } from "react";

export default function InputField({
  value,
  onChange,
  placeholder = "",
  className = "",
  type = "number",
  dynamicWidth = false,
}) {
  const inputRef = useRef(null);
  const [width, setWidth] = useState(null);

  useEffect(() => {
    if (dynamicWidth && inputRef.current) {
      // Create a temporary span to measure text width
      const measureElement = document.createElement('span');
      measureElement.style.visibility = 'hidden';
      measureElement.style.position = 'absolute';
      measureElement.style.fontSize = window.getComputedStyle(inputRef.current).fontSize;
      measureElement.style.fontFamily = window.getComputedStyle(inputRef.current).fontFamily;
      measureElement.style.padding = '0';
      measureElement.textContent = value !== undefined && value !== null ? String(value) : placeholder || '0';
      document.body.appendChild(measureElement);
      
      const measuredWidth = measureElement.offsetWidth;
      document.body.removeChild(measureElement);
      
      // Add padding (px-2 = 8px on each side = 16px total) and minimum width
      const minWidth = 48; // min-w-12 equivalent
      const padding = 16;
      const newWidth = Math.max(minWidth, measuredWidth + padding + 8); // +8 for extra space
      setWidth(newWidth);
    }
  }, [value, placeholder, dynamicWidth]);

  const baseClasses = dynamicWidth 
    ? `bg-white text-gray-900 px-2 py-0.5 mx-1 rounded text-center text-sm border border-gray-300 focus:outline-none focus:border-blue-500 ${className}`
    : `bg-white text-gray-900 min-w-20 w-20 px-2 py-0.5 mx-1 rounded text-center text-sm border border-gray-300 focus:outline-none focus:border-blue-500 ${className}`;

  return (
    <input
      ref={inputRef}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={baseClasses}
      style={dynamicWidth && width ? { width: `${width}px`, minWidth: '48px' } : {}}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    />
  );
}

