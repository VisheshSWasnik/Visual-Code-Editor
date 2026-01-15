import React, { useState } from "react";
import { useBlocks } from "../context/BlockContext";
import WorkspaceBlock from "./workspace/WorkspaceBlock";
import SpriteManager from "./SpriteManager";
import { createBlockFromType } from "../utils/blockUtils";

export default function MidArea() {
  const { blocks, addBlock, executeBlocks, stopExecution, isExecuting, selectedSprite, reorderBlock, allBlocks } = useBlocks();
  const [draggedOver, setDraggedOver] = useState(false);
  const [draggedBlockId, setDraggedBlockId] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);

  // Filter out inner blocks from main display - only show top-level blocks
  const topLevelBlocks = React.useMemo(() => {
    // Get all inner block IDs from repeat blocks
    const innerBlockIds = new Set();
    allBlocks.forEach(block => {
      if (block.type === 'control_repeat' && block.innerBlocks) {
        block.innerBlocks.forEach(innerId => innerBlockIds.add(innerId));
      }
    });
    // Return only blocks that are not inner blocks
    return blocks.filter(block => !innerBlockIds.has(block.id));
  }, [blocks, allBlocks]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDraggedOver(false);
    setDropIndex(null);
    
    const source = e.dataTransfer.getData("source");
    const blockId = e.dataTransfer.getData("blockId");
    
    // Handle reordering blocks within workspace
    if (source === "workspace" && (blockId || draggedBlockId)) {
      const blockIdToMove = blockId || draggedBlockId;
      // Get top-level blocks for index calculation
      const innerBlockIds = new Set();
      allBlocks.forEach(b => {
        if (b.type === 'control_repeat' && b.innerBlocks) {
          b.innerBlocks.forEach(innerId => innerBlockIds.add(innerId));
        }
      });
      const topLevelBlocks = blocks.filter(b => !innerBlockIds.has(b.id));
      const targetIndex = dropIndex !== null ? dropIndex : topLevelBlocks.length;
      const currentIndex = topLevelBlocks.findIndex((b) => b.id === blockIdToMove);
      
      if (currentIndex !== -1 && currentIndex !== targetIndex) {
        // Calculate the correct new index
        let newIndex = targetIndex;
        if (currentIndex < targetIndex) {
          newIndex = targetIndex - 1;
        }
        reorderBlock(blockIdToMove, newIndex);
      }
      setDraggedBlockId(null);
      return;
    }
    
    // Handle adding new blocks from sidebar
    if (source !== "workspace") {
      const blockType = e.dataTransfer.getData("blockType");
      if (!blockType) return;

      const direction = e.dataTransfer.getData("direction");
      const newBlock = createBlockFromType(blockType, { direction });
      
      // Insert at drop index if specified, otherwise append
      if (dropIndex !== null) {
        // For new blocks, we'll add them and then reorder
        addBlock(newBlock);
        // Small delay to ensure block is added before reordering
        setTimeout(() => {
          const newBlocks = [...blocks, newBlock];
          const newBlockIndex = newBlocks.findIndex((b) => b.id === newBlock.id);
          if (newBlockIndex !== -1) {
            reorderBlock(newBlock.id, dropIndex);
          }
        }, 10);
      } else {
        addBlock(newBlock);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    // Note: dataTransfer.getData() only works in drop event, not dragOver
    // So we use the draggedBlockId state instead
    const isWorkspaceDrag = !!draggedBlockId;
    e.dataTransfer.dropEffect = isWorkspaceDrag ? "move" : "copy";
    setDraggedOver(true);
  };

  const handleBlockDragStart = (blockId) => {
    setDraggedBlockId(blockId);
  };

  const handleBlockDragEnd = () => {
    setDraggedBlockId(null);
    setDropIndex(null);
  };

  const handleDropZoneEnter = (index) => {
    if (draggedBlockId) {
      setDropIndex(index);
    }
  };

  const handleDropZoneLeave = () => {
    setDropIndex(null);
  };

  const handleDragLeave = () => {
    setDraggedOver(false);
  };


  return (
    <div className="flex-1 h-full overflow-auto flex flex-col">
      <SpriteManager />
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Editing: <span className="font-semibold">{selectedSprite?.name || "Sprite1"}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Green Flag Button */}
          <button
            onClick={executeBlocks}
            disabled={isExecuting}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            title="Start execution"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Flag pole */}
              <line x1="3" y1="2" x2="3" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              {/* Flag triangle */}
              <path
                d="M3 3L13 3L11 7L13 11L3 11Z"
                fill="currentColor"
              />
            </svg>
          </button>
          {/* Red Stop Button */}
          <button
            onClick={stopExecution}
            disabled={!isExecuting}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            title="Stop execution"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M4 4h12v12H4V4z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div
        className="flex-1 p-4"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          backgroundColor: draggedOver ? "#e0f2fe" : "transparent",
          transition: "background-color 0.2s",
        }}
      >
        {topLevelBlocks.length === 0 && (
          <div className="text-gray-400 text-center py-20">
            <p className="text-lg mb-2">Drag blocks here to build your program</p>
            <p className="text-sm">Start with an "When flag clicked" block</p>
          </div>
        )}
        
        <div className="space-y-1">
          {topLevelBlocks.map((block, index) => (
            <React.Fragment key={block.id}>
              {/* Drop zone above each block - made larger and always visible when dragging */}
              <div
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (draggedBlockId) {
                    e.dataTransfer.dropEffect = "move";
                    handleDropZoneEnter(index);
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (draggedBlockId) {
                    e.dataTransfer.dropEffect = "move";
                    handleDropZoneEnter(index);
                  }
                }}
                onDragLeave={(e) => {
                  // More lenient check for drag leave
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX;
                  const y = e.clientY;
                  const margin = 10; // Add margin to prevent flickering
                  if (x < rect.left - margin || x > rect.right + margin || y < rect.top - margin || y > rect.bottom + margin) {
                    handleDropZoneLeave();
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const source = e.dataTransfer.getData("source");
                  const blockId = e.dataTransfer.getData("blockId");
                  if ((source === "workspace" || draggedBlockId) && (blockId || draggedBlockId)) {
                    const blockIdToMove = blockId || draggedBlockId;
                    const currentIndex = topLevelBlocks.findIndex((b) => b.id === blockIdToMove);
                    if (currentIndex !== -1 && currentIndex !== index) {
                      // Calculate new index: if moving down, subtract 1; if moving up, use index as-is
                      let newIndex = index;
                      if (currentIndex < index) {
                        newIndex = index - 1;
                      }
                      reorderBlock(blockIdToMove, newIndex);
                    }
                    setDraggedBlockId(null);
                    setDropIndex(null);
                  }
                }}
                className={`transition-all duration-200 ${
                  dropIndex === index ? "h-6 bg-blue-400 rounded my-1 border-2 border-blue-500 border-dashed" : draggedBlockId ? "h-3 bg-blue-200 rounded my-0.5 border border-blue-300 border-dashed opacity-50" : "h-2"
                }`}
                style={{ 
                  minHeight: dropIndex === index ? '24px' : draggedBlockId ? '12px' : '8px',
                  cursor: draggedBlockId ? 'move' : 'default',
                  pointerEvents: 'auto',
                  zIndex: 10
                }}
              />
              <WorkspaceBlock 
                block={block} 
                index={index}
                blocks={blocks}
                onDragStart={() => handleBlockDragStart(block.id)}
                onDragEnd={handleBlockDragEnd}
                onDrop={() => {
                  setDraggedBlockId(null);
                  setDropIndex(null);
                }}
                draggedBlockId={draggedBlockId}
              />
            </React.Fragment>
          ))}
          {/* Drop zone at the end */}
          {topLevelBlocks.length > 0 && (
            <div
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (draggedBlockId) {
                  e.dataTransfer.dropEffect = "move";
                  handleDropZoneEnter(topLevelBlocks.length);
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (draggedBlockId) {
                  e.dataTransfer.dropEffect = "move";
                  handleDropZoneEnter(topLevelBlocks.length);
                }
              }}
              onDragLeave={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX;
                const y = e.clientY;
                if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                  handleDropZoneLeave();
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const source = e.dataTransfer.getData("source");
                const blockId = e.dataTransfer.getData("blockId");
                if (source === "workspace" && (blockId || draggedBlockId)) {
                  const blockIdToMove = blockId || draggedBlockId;
                  const currentIndex = topLevelBlocks.findIndex((b) => b.id === blockIdToMove);
                  if (currentIndex !== -1 && currentIndex !== topLevelBlocks.length - 1) {
                    reorderBlock(blockIdToMove, topLevelBlocks.length - 1);
                  }
                  setDraggedBlockId(null);
                  setDropIndex(null);
                }
              }}
              className={`transition-all duration-200 ${
                dropIndex === topLevelBlocks.length ? "h-4 bg-blue-400 rounded my-1 border-2 border-blue-500 border-dashed" : "h-2"
              }`}
              style={{ 
                minHeight: dropIndex === topLevelBlocks.length ? '16px' : '8px',
                cursor: draggedBlockId ? 'move' : 'default',
                pointerEvents: draggedBlockId ? 'auto' : 'auto'
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
