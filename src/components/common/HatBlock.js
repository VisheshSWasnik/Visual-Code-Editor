import React from "react";

export default function HatBlock({
  color,
  children,
  onDragStart,
  isDraggable = true,
  className = "",
}) {
  const handleDragStart = (e) => {
    if (isDraggable && onDragStart) {
      if (onDragStart.length <= 1) {
        onDragStart(e);
      } else {
        onDragStart(e, "hat");
      }
    } else if (!isDraggable) {
      // If not draggable, prevent any drag behavior
      e.preventDefault();
      e.stopPropagation();
    }
  };

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
      className={`flex flex-row flex-wrap items-center ${color} text-white px-3 py-2.5 my-1.5 text-sm ${isDraggable ? 'cursor-move' : 'cursor-default'} rounded ${className}`}
    >
      {children}
    </div>
  );
}

