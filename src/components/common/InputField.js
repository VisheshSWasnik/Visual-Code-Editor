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
      requestAnimationFrame(() => {
        if (!inputRef.current) return;
        
        const originalWidth = inputRef.current.style.width;
        inputRef.current.style.width = 'auto';
        
        const measureElement = document.createElement('span');
        measureElement.style.visibility = 'hidden';
        measureElement.style.position = 'absolute';
        measureElement.style.whiteSpace = 'pre'; // Preserve whitespace
        measureElement.style.fontSize = window.getComputedStyle(inputRef.current).fontSize;
        measureElement.style.fontFamily = window.getComputedStyle(inputRef.current).fontFamily;
        measureElement.style.fontWeight = window.getComputedStyle(inputRef.current).fontWeight;
        measureElement.style.letterSpacing = window.getComputedStyle(inputRef.current).letterSpacing;
        measureElement.style.padding = '0';
        measureElement.style.border = 'none';
        measureElement.style.margin = '0';
        
        // Use the actual value or placeholder, ensuring we measure the full text
        const textToMeasure = value !== undefined && value !== null ? String(value) : placeholder || '0';
        measureElement.textContent = textToMeasure;
        document.body.appendChild(measureElement);
        
        const measuredWidth = measureElement.offsetWidth;
        document.body.removeChild(measureElement);
        
        // Restore original width
        inputRef.current.style.width = originalWidth;
        
        const minWidth = 48; 
        const padding = 16;
        const border = 2; 
        const buffer = 16; 
        const newWidth = Math.max(minWidth, measuredWidth + padding + border + buffer);
        setWidth(newWidth);
      });
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
      style={dynamicWidth && width ? { 
        width: `${width}px`, 
        minWidth: '48px', 
        boxSizing: 'border-box'
      } : {}}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    />
  );
}

