import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

const BlockContext = createContext();

export const useBlocks = () => {
  const context = useContext(BlockContext);
  if (!context) {
    throw new Error("useBlocks must be used within BlockProvider");
  }
  return context;
};

export const BlockProvider = ({ children }) => {
  const [sprites, setSprites] = useState([
    {
      id: "sprite_1",
      name: "Sprite1",
      x: 0,
      y: 0,
      rotation: 0,
      speechBubble: null,
      thoughtBubble: null,
    },
  ]);
  const [selectedSpriteId, setSelectedSpriteId] = useState("sprite_1");
  const [blocks, setBlocks] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const addBlock = useCallback((block) => {
    setBlocks((prev) => [...prev, { ...block, spriteId: selectedSpriteId }]);
  }, [selectedSpriteId]);

  const removeBlock = useCallback((id) => {
    setBlocks((prev) => prev.filter((block) => block.id !== id));
  }, []);

  const updateBlock = useCallback((id, updates) => {
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, ...updates } : block))
    );
  }, []);

  // Helper to get all blocks (for inner blocks lookup)
  const getAllBlocks = useCallback(() => blocks, [blocks]);

  const clearBlocks = useCallback(() => {
    setBlocks([]);
  }, []);

  // Collision detection - check if two sprites are touching
  const checkCollision = useCallback((sprite1, sprite2) => {
    // Sprite size is approximately 95x100, so we'll use a collision threshold
    const collisionThreshold = 60; // pixels
    const distance = Math.sqrt(
      Math.pow(sprite1.x - sprite2.x, 2) + Math.pow(sprite1.y - sprite2.y, 2)
    );
    return distance < collisionThreshold;
  }, []);

  // Ref to track blocks during execution for collision swaps
  const blocksRef = useRef(blocks);
  const executedBlocksRef = useRef(new Map()); // Track executed blocks per sprite
  
  // Update ref when blocks change
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  // Swap blocks between two sprites
  const swapSpriteBlocks = useCallback((spriteId1, spriteId2) => {
    setBlocks((prev) => {
      const sprite1Blocks = prev.filter((b) => b.spriteId === spriteId1);
      const sprite2Blocks = prev.filter((b) => b.spriteId === spriteId2);
      
      // Create new blocks with swapped spriteIds (preserve block data, just swap ownership)
      const timestamp = Date.now();
      const newSprite1Blocks = sprite2Blocks.map((block, index) => ({
        ...block,
        id: `block_${timestamp}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        spriteId: spriteId1,
      }));
      
      const newSprite2Blocks = sprite1Blocks.map((block, index) => ({
        ...block,
        id: `block_${timestamp}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        spriteId: spriteId2,
      }));
      
      // Remove old blocks and add new swapped blocks
      const otherBlocks = prev.filter(
        (b) => b.spriteId !== spriteId1 && b.spriteId !== spriteId2
      );
      
      const newBlocks = [...otherBlocks, ...newSprite1Blocks, ...newSprite2Blocks];
      blocksRef.current = newBlocks;
      
      // Reset executed blocks for both sprites so they can execute their new blocks
      executedBlocksRef.current.set(spriteId1, new Set());
      executedBlocksRef.current.set(spriteId2, new Set());
      
      return newBlocks;
    });
  }, []);

  const moveSteps = useCallback(async (steps, spriteId, currentState) => {
    // Move horizontally along x-axis (positive = right, negative = left)
    const newX = currentState.x + steps;
    
    setSprites((prev) => {
      const updated = prev.map((sprite) =>
        sprite.id === spriteId ? { ...sprite, x: newX } : sprite
      );
      
      // Check for collisions after movement
      const movedSprite = updated.find((s) => s.id === spriteId);
      if (movedSprite) {
        for (const otherSprite of updated) {
          if (otherSprite.id !== spriteId && checkCollision(movedSprite, otherSprite)) {
            // Collision detected - swap blocks
            swapSpriteBlocks(spriteId, otherSprite.id);
            break; // Only swap once per movement
          }
        }
      }
      
      return updated;
    });
    
    await new Promise((resolve) => setTimeout(resolve, 300));
  }, [checkCollision, swapSpriteBlocks]);

  const turnDegrees = useCallback(async (degrees, spriteId) => {
    setSprites((prev) =>
      prev.map((sprite) =>
        sprite.id === spriteId
          ? { ...sprite, rotation: sprite.rotation + degrees }
          : sprite
      )
    );
    
    await new Promise((resolve) => setTimeout(resolve, 300));
  }, []);

  const gotoXY = useCallback(async (x, y, spriteId) => {
    setSprites((prev) => {
      const updated = prev.map((sprite) =>
        sprite.id === spriteId ? { ...sprite, x: x, y: y } : sprite
      );
      
      // Check for collisions after movement
      const movedSprite = updated.find((s) => s.id === spriteId);
      if (movedSprite) {
        for (const otherSprite of updated) {
          if (otherSprite.id !== spriteId && checkCollision(movedSprite, otherSprite)) {
            // Collision detected - swap blocks
            swapSpriteBlocks(spriteId, otherSprite.id);
            break; // Only swap once per movement
          }
        }
      }
      
      return updated;
    });
    
    await new Promise((resolve) => setTimeout(resolve, 300));
  }, [checkCollision, swapSpriteBlocks]);

  const executeBlockRef = useRef();
  
  const executeBlock = useCallback(async (block, currentBlocks, spriteId) => {
    const sprite = sprites.find((s) => s.id === spriteId);
    if (!sprite) return;
    
    const currentState = sprite;
    
    switch (block.type) {
      case "motion_move_steps":
        await moveSteps(block.value || 10, spriteId, currentState);
        break;
      case "motion_turn_degrees":
        const degrees = block.direction === "counterclockwise" 
          ? -(block.value || 15) 
          : (block.value || 15);
        await turnDegrees(degrees, spriteId);
        break;
      case "motion_goto_xy":
        await gotoXY(block.x || 0, block.y || 0, spriteId);
        break;
      case "control_repeat":
        const times = block.value || 10;
        const innerBlocks = block.innerBlocks || [];
        for (let i = 0; i < times; i++) {
          if (innerBlocks.length > 0) {
            for (const innerBlockId of innerBlocks) {
              const innerBlock = currentBlocks.find((b) => b.id === innerBlockId);
              if (innerBlock && executeBlockRef.current) {
                await executeBlockRef.current(innerBlock, currentBlocks, spriteId);
              }
            }
          }
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        break;
      case "looks_say":
        const sayMessage = block.message || "Hello!";
        const saySeconds = block.seconds || 2;
        // Show speech bubble
        setSprites((prev) =>
          prev.map((s) =>
            s.id === spriteId
              ? { ...s, speechBubble: sayMessage, thoughtBubble: null }
              : s
          )
        );
        // Wait for the specified duration
        await new Promise((resolve) => setTimeout(resolve, saySeconds * 1000));
        // Hide speech bubble
        setSprites((prev) =>
          prev.map((s) =>
            s.id === spriteId ? { ...s, speechBubble: null } : s
          )
        );
        break;
      case "looks_think":
        const thinkMessage = block.message || "Hmm...";
        const thinkSeconds = block.seconds || 2;
        // Show thought bubble
        setSprites((prev) =>
          prev.map((s) =>
            s.id === spriteId
              ? { ...s, thoughtBubble: thinkMessage, speechBubble: null }
              : s
          )
        );
        // Wait for the specified duration
        await new Promise((resolve) => setTimeout(resolve, thinkSeconds * 1000));
        // Hide thought bubble
        setSprites((prev) =>
          prev.map((s) =>
            s.id === spriteId ? { ...s, thoughtBubble: null } : s
          )
        );
        break;
      default:
        // Wait a bit for visual feedback
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }, [moveSteps, turnDegrees, gotoXY, sprites]);
  
  // Set the ref after the function is defined
  executeBlockRef.current = executeBlock;

  const executeBlocks = useCallback(async () => {`n    try {`n      // CRITICAL FIX: Sync blocksRef with current blocks state`n      blocksRef.current = blocks;
    if (isExecuting) return;
    setIsExecuting(true);
    
    // Reset all sprites
    setSprites((prev) =>
      prev.map((sprite) => ({
        ...sprite,
        x: 0,
        y: 0,
        rotation: 0,
        speechBubble: null,
        thoughtBubble: null,
      }))
    );
    
    // Wait a bit for the reset to take effect
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Initialize executed blocks tracking
    executedBlocksRef.current = new Map();
    sprites.forEach((sprite) => {
      executedBlocksRef.current.set(sprite.id, new Set());
    });

    // Execute all sprites simultaneously with collision detection
    const executeSprite = async (sprite) => {
      let maxExecutions = 200; // Safety limit
      let executionCount = 0;
      
      while (executionCount < maxExecutions) {
        // Get current blocks (may have changed due to collision)
        const spriteBlocks = blocksRef.current.filter((b) => b.spriteId === sprite.id);
        const executedIds = executedBlocksRef.current.get(sprite.id) || new Set();
        const blocksToExecute = spriteBlocks.filter(
          (b) => b.type !== "event_when_flag_clicked" && !executedIds.has(b.id)
        );
        
        if (blocksToExecute.length === 0) break;
        
        // Execute blocks one by one
        for (const block of blocksToExecute) {
          // Get latest blocks in case of swap
          const latestBlocks = blocksRef.current.filter((b) => b.spriteId === sprite.id);
          await executeBlock(block, latestBlocks, sprite.id);
          
          // Mark as executed
          const currentExecuted = executedBlocksRef.current.get(sprite.id) || new Set();
          currentExecuted.add(block.id);
          executedBlocksRef.current.set(sprite.id, currentExecuted);
          
          // Small delay for collision detection and state updates
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        
        executionCount++;
      }
    };
    
    // Execute all sprites
    const executionPromises = sprites.map((sprite) => {
      const spriteBlocks = blocksRef.current.filter((b) => b.spriteId === sprite.id);
      const startBlock = spriteBlocks.find(
        (block) => block.type === "event_when_flag_clicked"
      );
      if (!startBlock) return Promise.resolve();
      return executeSprite(sprite);
    });

    // Wait for all sprites to finish
    await Promise.all(executionPromises);
    
    setIsExecuting(false);
  }, [isExecuting, executeBlock, sprites]);

  // Sprite management functions
  const addSprite = useCallback(() => {
    const newId = `sprite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newSprite = {
      id: newId,
      name: `Sprite${sprites.length + 1}`,
      x: 0,
      y: 0,
      rotation: 0,
      speechBubble: null,
      thoughtBubble: null,
    };
    setSprites((prev) => [...prev, newSprite]);
    setSelectedSpriteId(newId);
  }, [sprites.length]);

  const removeSprite = useCallback((spriteId) => {
    if (sprites.length <= 1) return; // Don't allow removing the last sprite
    
    setSprites((prev) => prev.filter((s) => s.id !== spriteId));
    setBlocks((prev) => prev.filter((b) => b.spriteId !== spriteId));
    
    // If removed sprite was selected, select the first remaining sprite
    if (selectedSpriteId === spriteId) {
      const remaining = sprites.filter((s) => s.id !== spriteId);
      if (remaining.length > 0) {
        setSelectedSpriteId(remaining[0].id);
      }
    }
  }, [sprites, selectedSpriteId]);

  const selectSprite = useCallback((spriteId) => {
    setSelectedSpriteId(spriteId);
  }, []);

  // Get blocks for selected sprite
  const selectedSpriteBlocks = blocks.filter((b) => b.spriteId === selectedSpriteId);
  const selectedSprite = sprites.find((s) => s.id === selectedSpriteId);

  const value = {
    blocks: selectedSpriteBlocks,
    allBlocks: blocks,
    getAllBlocks,
    addBlock,
    removeBlock,
    updateBlock,
    clearBlocks,
    executeBlocks,
    isExecuting,
    sprites,
    selectedSpriteId,
    selectedSprite,
    addSprite,
    removeSprite,
    selectSprite,
  };

  return <BlockContext.Provider value={value}>{children}</BlockContext.Provider>;
};

