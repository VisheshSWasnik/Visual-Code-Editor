import React from "react";
import { useBlocks } from "../context/BlockContext";
import CatSprite from "./CatSprite";

export default function PreviewArea() {
  const { sprites } = useBlocks();

  return (
    <div className="flex-none h-full overflow-hidden flex flex-col w-full">
      <div className="font-bold text-gray-700 mb-2 px-2 pt-2">Preview</div>
      <div className="relative bg-white overflow-hidden border border-blue-200 m-2" style={{ minWidth: "480px", maxWidth: "480px", width: "480px", minHeight: "360px", maxHeight: "360px", height: "360px" }}>
        {sprites.map((sprite, index) => (
          <React.Fragment key={sprite.id}>
            {/* Sprite */}
            <div
              className="absolute transition-all duration-300 ease-in-out"
              style={{
                left: `calc(50% + ${sprite.x}px + ${index * 20}px)`,
                top: `calc(50% + ${-sprite.y}px + ${index * 20}px)`,
                transform: `translate(-50%, -50%) rotate(${sprite.rotation}deg)`,
                transformOrigin: "center",
                zIndex: index + 1,
              }}
            >
              <CatSprite />
            </div>

            {/* Speech Bubble */}
            {sprite.speechBubble && (
              <div
                className="absolute transition-all duration-200 ease-in-out pointer-events-none"
                style={{
                  left: `calc(50% + ${sprite.x}px + ${index * 20}px)`,
                  top: `calc(50% + ${-sprite.y}px + ${index * 20}px - 80px)`,
                  transform: "translateX(-50%) translateY(-100%)",
                  zIndex: 10 + index,
                }}
              >
                <div className="bg-white border-2 border-gray-800 rounded-lg px-3 py-2 shadow-lg relative">
                  <div className="text-sm font-medium text-gray-900 whitespace-nowrap max-w-xs">
                    {sprite.speechBubble}
                  </div>
                  {/* Speech bubble tail pointing down to sprite */}
                  <div
                    className="absolute top-full left-1/2 transform -translate-x-1/2"
                    style={{
                      width: "0",
                      height: "0",
                      borderLeft: "8px solid transparent",
                      borderRight: "8px solid transparent",
                      borderTop: "12px solid #1f2937",
                    }}
                  />
                  <div
                    className="absolute top-full left-1/2 transform -translate-x-1/2"
                    style={{
                      width: "0",
                      height: "0",
                      borderLeft: "6px solid transparent",
                      borderRight: "6px solid transparent",
                      borderTop: "10px solid white",
                      marginTop: "-2px",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Thought Bubble */}
            {sprite.thoughtBubble && (
              <div
                className="absolute transition-all duration-200 ease-in-out pointer-events-none"
                style={{
                  left: `calc(50% + ${sprite.x}px + ${index * 20}px - 10px)`,
                  top: `calc(50% + ${-sprite.y}px + ${index * 20}px - 80px)`,
                  transform: "translateX(-50%) translateY(-100%)",
                  zIndex: 10 + index,
                }}
              >
                <div className="bg-white border-2 border-gray-800 rounded-full px-3 py-2 shadow-lg relative">
                  <div className="text-sm font-medium text-gray-900 whitespace-nowrap max-w-xs">
                    {sprite.thoughtBubble}
                  </div>
                  {/* Thought bubble circles connecting to sprite */}
                  <div className="absolute top-full left-3/4 transform -translate-x-1/2">
                    <div className="absolute w-2 h-2 bg-gray-800 rounded-full" style={{ left: "-8px", top: "4px" }} />
                    <div className="absolute w-2 h-2 bg-gray-800 rounded-full" style={{ left: "0px", top: "8px" }} />
                    <div className="absolute w-1.5 h-1.5 bg-gray-800 rounded-full" style={{ left: "8px", top: "12px" }} />
                  </div>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
