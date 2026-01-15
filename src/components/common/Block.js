import React from "react";

export default function Block({
  type,
  color,
  children,
  onDragStart,
  isDraggable = true,
  className = "",
}) {
  const handleDragStart = (e) => {
    if (isDraggable && onDragStart) {
      // Call the handler - it may be a custom handler or the default (e, type) signature
      if (onDragStart.length <= 1) {
        // Custom handler that only takes the event
        onDragStart(e);
      } else {
        // Default handler that takes (e, type)
        onDragStart(e, type);
      }
    } else if (!isDraggable) {
      // If not draggable, prevent any drag behavior
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const hasNoWrap = className.includes('flex-nowrap');
  const wrapClass = hasNoWrap ? 'flex-nowrap' : 'flex-wrap';
  const cleanClassName = className.replace('flex-nowrap', '').trim();
  
  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDrag={(e) => {
        if (!isDraggable) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      className={`flex flex-row ${wrapClass} items-center ${color} text-white px-3 py-2.5 my-1.5 text-sm ${isDraggable ? 'cursor-move' : 'cursor-default'} rounded ${cleanClassName}`}
    >
      {children}
    </div>
  );
}

