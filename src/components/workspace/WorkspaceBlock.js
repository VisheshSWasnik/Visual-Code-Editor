import React from "react";
import { useBlocks } from "../../context/BlockContext";
import MotionMoveSteps from "../blocks/MotionMoveSteps";
import MotionTurnDegrees from "../blocks/MotionTurnDegrees";
import MotionGotoXY from "../blocks/MotionGotoXY";
import ControlRepeat from "../blocks/ControlRepeat";
import EventWhenFlagClicked from "../blocks/EventWhenFlagClicked";
import LooksSay from "../blocks/LooksSay";
import LooksThink from "../blocks/LooksThink";
import { createBlockFromType } from "../../utils/blockUtils";

const blockComponents = {
  motion_move_steps: MotionMoveSteps,
  motion_turn_degrees: MotionTurnDegrees,
  motion_goto_xy: MotionGotoXY,
  control_repeat: ControlRepeat,
  event_when_flag_clicked: EventWhenFlagClicked,
  looks_say: LooksSay,
  looks_think: LooksThink,
};

export default function WorkspaceBlock({ block, onDragStart, onDragEnd, draggedBlockId, onDrop, index, blocks, isInnerBlock = false, parentBlockId = null }) {
  const { updateBlock, removeBlock, allBlocks, addBlock, reorderBlock } = useBlocks();
  const BlockComponent = blockComponents[block.type];

  if (!BlockComponent) return null;

  const handleUpdate = (updates) => {
    updateBlock(block.id, updates);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // removeBlock automatically handles removing from innerBlocks arrays
    removeBlock(block.id);
  };

  const getBlockProps = () => {
    const baseProps = {
      isInWorkspace: true,
      onDragStart: null,
      isDraggable: false, // Disable Block's own drag - WorkspaceBlock handles it
    };

    switch (block.type) {
      case "motion_move_steps":
        return {
          ...baseProps,
          value: block.value,
          onChange: (value) => handleUpdate({ value: parseInt(value) || 0 }),
        };
      case "motion_turn_degrees":
        return {
          ...baseProps,
          value: block.value,
          direction: block.direction,
          onChange: (value) => handleUpdate({ value: parseInt(value) || 0 }),
        };
      case "motion_goto_xy":
        return {
          ...baseProps,
          x: block.x,
          y: block.y,
          onXChange: (value) => handleUpdate({ x: parseInt(value) || 0 }),
          onYChange: (value) => handleUpdate({ y: parseInt(value) || 0 }),
        };
      case "control_repeat":
        return {
          ...baseProps,
          value: block.value,
          onChange: (value) => handleUpdate({ value: parseInt(value) || 0 }),
          innerBlocks: (block.innerBlocks || []).map((innerBlockId) => {
            const innerBlock = allBlocks.find((b) => b.id === innerBlockId);
            return innerBlock ? { id: innerBlockId, component: <WorkspaceBlock key={innerBlockId} block={innerBlock} isInnerBlock={true} parentBlockId={block.id} /> } : null;
          }).filter(Boolean),
          onDropInside: (e) => {
            e.preventDefault();
            e.stopPropagation();
            const blockType = e.dataTransfer.getData("blockType");
            const direction = e.dataTransfer.getData("direction");
            if (blockType) {
              const newInnerBlock = createBlockFromType(blockType, { direction });
              const currentInnerBlocks = block.innerBlocks || [];
              handleUpdate({ innerBlocks: [...currentInnerBlocks, newInnerBlock.id] });
              // Also add the block to the main blocks array
              addBlock(newInnerBlock);
            }
          },
        };
      case "looks_say":
        return {
          ...baseProps,
          message: block.message !== undefined ? block.message : "Hello!",
          seconds: block.seconds || 2,
          onChangeMessage: (value) => handleUpdate({ message: value }),
          onChangeSeconds: (value) => handleUpdate({ seconds: parseFloat(value) || 0 }),
        };
      case "looks_think":
        return {
          ...baseProps,
          message: block.message !== undefined ? block.message : "Hmm...",
          seconds: block.seconds || 2,
          onChangeMessage: (value) => handleUpdate({ message: value }),
          onChangeSeconds: (value) => handleUpdate({ seconds: parseFloat(value) || 0 }),
        };
      default:
        return baseProps;
    }
  };

  const handleDragStart = (e) => {
    e.stopPropagation(); // Prevent Block component from handling this
    e.dataTransfer.setData("blockId", block.id);
    e.dataTransfer.setData("source", "workspace");
    e.dataTransfer.effectAllowed = "move";
    if (onDragStart) {
      onDragStart(block.id);
    }
  };

  const handleDragEnd = (e) => {
    if (onDragEnd) {
      onDragEnd();
    }
  };

  const handleDropOnBlock = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const source = e.dataTransfer.getData("source");
    const blockId = e.dataTransfer.getData("blockId");
    
      if ((source === "workspace" || draggedBlockId) && (blockId || draggedBlockId)) {
      const blockIdToMove = blockId || draggedBlockId;
      if (blockIdToMove && blockIdToMove !== block.id && index !== undefined) {
        const currentIndex = allBlocks.findIndex((b) => b.id === blockIdToMove);
        if (currentIndex !== -1 && currentIndex !== index) {
          let newIndex = index;
          if (currentIndex < index) {
            newIndex = index - 1;
          }
          reorderBlock(blockIdToMove, newIndex);
        }
      }
      if (onDrop) {
        onDrop();
      }
    }
  };

  return (
    <div
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={(e) => {
        if (draggedBlockId && draggedBlockId !== block.id) {
          e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.dropEffect = "move";
        }
      }}
      onDrop={handleDropOnBlock}
      draggable={true}
      className="cursor-move relative group"
      style={{ 
        opacity: draggedBlockId === block.id ? 0.5 : 1,
        transition: 'opacity 0.2s'
      }}
      onMouseDown={(e) => {
        // Allow dragging to start
        e.stopPropagation();
      }}
    >
      {/* Delete button - appears on hover */}
      <button
        onClick={handleDelete}
        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 shadow-md"
        style={{ fontSize: '12px' }}
        title="Delete block"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div 
        onMouseDown={(e) => e.stopPropagation()}
        onDragStart={(e) => {
          // Prevent Block component from interfering
          e.stopPropagation();
        }}
      >
        <BlockComponent {...getBlockProps()} />
      </div>
    </div>
  );
}

