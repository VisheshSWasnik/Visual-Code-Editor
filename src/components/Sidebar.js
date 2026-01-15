import React, { useState } from "react";
import { useBlocks } from "../context/BlockContext";
import EventWhenFlagClicked from "./blocks/EventWhenFlagClicked";
import MotionMoveSteps from "./blocks/MotionMoveSteps";
import MotionTurnDegrees from "./blocks/MotionTurnDegrees";
import MotionGotoXY from "./blocks/MotionGotoXY";
import ControlRepeat from "./blocks/ControlRepeat";
import LooksSay from "./blocks/LooksSay";
import LooksThink from "./blocks/LooksThink";

export default function Sidebar() {
  const { removeBlock } = useBlocks();
  const [draggedOver, setDraggedOver] = useState(false);

  const handleDragStart = (e, blockType, extraData = {}) => {
    e.dataTransfer.setData("blockType", blockType);
    if (extraData.direction) {
      e.dataTransfer.setData("direction", extraData.direction);
    }
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOver(false);

    const source = e.dataTransfer.getData("source");
    const blockId = e.dataTransfer.getData("blockId");

    // If dragging from workspace, remove the block
    if (source === "workspace" && blockId) {
      removeBlock(blockId);
    }
  };

  const handleDragOver = (e) => {
    const source = e.dataTransfer.getData("source");
    if (source === "workspace") {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";
      setDraggedOver(true);
    }
  };

  const handleDragLeave = (e) => {
    // Only reset if we're actually leaving the sidebar area
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDraggedOver(false);
    }
  };

  const categories = [
    {
      name: "Events",
      color: "bg-yellow-200",
      borderColor: "border-yellow-500",
      textColor: "text-yellow-900",
      icon: "⚡",
      blocks: [
        { component: EventWhenFlagClicked, type: "event_when_flag_clicked" }
      ]
    },
    {
      name: "Motion",
      color: "bg-blue-200",
      borderColor: "border-blue-500",
      textColor: "text-blue-900",
      icon: "↻",
      blocks: [
        { component: MotionMoveSteps, type: "motion_move_steps" },
        { component: MotionTurnDegrees, type: "motion_turn_degrees", direction: "counterclockwise" },
        { component: MotionTurnDegrees, type: "motion_turn_degrees", direction: "clockwise" },
        { component: MotionGotoXY, type: "motion_goto_xy" }
      ]
    },
    {
      name: "Looks",
      color: "bg-purple-200",
      borderColor: "border-purple-500",
      textColor: "text-purple-900",
      icon: "👁️",
      blocks: [
        { component: LooksSay, type: "looks_say" },
        { component: LooksThink, type: "looks_think" }
      ]
    },
    {
      name: "Control",
      color: "bg-orange-100",
      borderColor: "border-orange-500",
      textColor: "text-orange-900",
      icon: "🔄",
      blocks: [
        { component: ControlRepeat, type: "control_repeat" }
      ]
    }
  ];

  return (
    <>
      <style>{`
        .sidebar-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .sidebar-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .sidebar-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      <div
        className="sidebar-scrollbar w-64 flex-none h-full overflow-y-auto flex flex-col bg-gray-50 border-r border-gray-300 shadow-sm"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          backgroundColor: draggedOver ? "#fee2e2" : "#f9fafb",
          transition: "background-color 0.2s",
          scrollbarWidth: "thin",
          scrollbarColor: "#cbd5e1 #f1f5f9",
        }}
      >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Blocks</h2>
        <p className="text-xs text-gray-500 mt-1">Drag blocks to workspace</p>
      </div>

      {/* Categories */}
      <div className="flex-1 px-3 py-4 space-y-4">
        {categories.map((category, categoryIndex) => (
          <div key={category.name} className="space-y-2">
            {/* Category Header */}
            <div 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${category.name === "Control" ? "" : category.color} ${category.borderColor} border-l-4`}
              style={{
                backgroundColor: category.name === "Control" 
                  ? "#fed7aa" 
                  : undefined,
                borderLeftColor: category.name === "Control" 
                  ? "#f97316" 
                  : category.name === "Events"
                  ? "#eab308"
                  : category.name === "Motion"
                  ? "#3b82f6"
                  : category.name === "Looks"
                  ? "#a855f7"
                  : undefined,
                borderLeftWidth: "4px"
              }}
            >
              <span className="text-lg">{category.icon}</span>
              <h3 className={`text-sm font-bold ${category.textColor} uppercase tracking-wide`}>
                {category.name}
              </h3>
            </div>

            {/* Category Blocks */}
            <div className="space-y-1.5 pl-1">
              {category.blocks.map((block, blockIndex) => {
                const BlockComponent = block.component;
                return (
                  <div key={`${block.type}-${blockIndex}`} className="transform transition-transform hover:scale-[1.02]">
                    <BlockComponent
                      onDragStart={(e) => {
                        if (block.direction) {
                          handleDragStart(e, block.type, { direction: block.direction });
                        } else {
                          handleDragStart(e, block.type);
                        }
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer - Drop zone indicator */}
      {draggedOver && (
        <div className="sticky bottom-0 bg-red-100 border-t-2 border-red-400 px-4 py-3 text-center">
          <p className="text-sm font-semibold text-red-700">Drop here to delete</p>
        </div>
      )}
      </div>
    </>
  );
}
