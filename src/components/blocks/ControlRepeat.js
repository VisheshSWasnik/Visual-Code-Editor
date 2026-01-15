import React from "react";
import InputField from "../common/InputField";

export default function ControlRepeat({
  value = 10,
  onChange,
  innerBlocks = [],
  isInWorkspace = false,
  onDragStart,
  onDropInside,
}) {
  return (
    <div 
      className="my-1.5"
      draggable={!isInWorkspace}
      onDragStart={onDragStart}
      style={{
        cursor: isInWorkspace ? "default" : "move"
      }}
    >
      {/* C-shaped Scratch-style Repeat Block */}
      <div
        className="relative"
        style={{
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
        }}
      >
        {/* Top Bar - Repeat [input] times */}
        <div
          className="text-white px-4 py-3 rounded-t-lg flex items-center gap-2"
          style={{
            backgroundColor: '#f97316', // orange-500
            color: '#ffffff',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            borderBottom: '2px solid rgba(0, 0, 0, 0.1)',
          }}
        >
          <span className="font-bold text-sm" style={{ letterSpacing: '0.3px', color: '#ffffff' }}>repeat</span>
          <InputField
            value={value}
            onChange={onChange}
            placeholder="10"
          />
          <span className="font-bold text-sm" style={{ letterSpacing: '0.3px', color: '#ffffff' }}>times</span>
        </div>

        {/* C-shaped Container with Inner Drop Zone */}
        <div
          className="rounded-b-lg"
          style={{
            backgroundColor: '#f97316', // orange-500
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2), inset 0 2px 0 rgba(0, 0, 0, 0.1)',
            padding: '2px',
          }}
        >
          {/* Inner Drop Zone */}
          <div
            className="min-h-12 bg-gray-50 border-2 border-dashed border-gray-400 rounded-lg p-3 transition-all duration-200"
            style={{
              borderRadius: '0 0 0.5rem 0.5rem',
            }}
            onDrop={onDropInside}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.add("border-orange-500", "bg-orange-50");
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove("border-orange-500", "bg-orange-50");
            }}
          >
            {innerBlocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="text-gray-500 text-xs font-medium mb-0.5">Drop blocks here</div>
                <div className="text-gray-400 text-xs">Blocks will repeat {value} times</div>
              </div>
            ) : (
              <div className="space-y-1.5">
                {innerBlocks.map((block) => block.component)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


