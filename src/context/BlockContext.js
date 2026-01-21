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
  const shouldStopRef = useRef(false);

  const addBlock = useCallback((block) => {
    setBlocks((prev) => [...prev, { ...block, spriteId: selectedSpriteId }]);
  }, [selectedSpriteId]);

  const removeBlock = useCallback((id) => {
    setBlocks((prev) => {
      // First, remove the block from any repeat block's innerBlocks array
      const updatedBlocks = prev.map((block) => {
        if (block.type === 'control_repeat' && block.innerBlocks && block.innerBlocks.includes(id)) {
          return {
            ...block,
            innerBlocks: block.innerBlocks.filter(innerId => innerId !== id)
          };
        }
        return block;
      });

      const finalBlocks = updatedBlocks.filter((block) => block.id !== id);

      // If the selected sprite no longer has any blocks, reset it to original position/rotation
      const hasBlocksForSelectedSprite = finalBlocks.some(
        (block) => block.spriteId === selectedSpriteId
      );

      if (!hasBlocksForSelectedSprite) {
        setSprites((prevSprites) =>
          prevSprites.map((sprite) =>
            sprite.id === selectedSpriteId
              ? {
                  ...sprite,
                  x: 0,
                  y: 0,
                  rotation: 0,
                  speechBubble: null,
                  thoughtBubble: null,
                }
              : sprite
          )
        );
      }

      return finalBlocks;
    });
  }, [selectedSpriteId]);

  const updateBlock = useCallback((id, updates) => {
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, ...updates } : block))
    );
  }, []);

  // Helper to get all blocks (for inner blocks lookup)
  const getAllBlocks = useCallback(() => blocks, [blocks]);

  const clearBlocks = useCallback(() => {
    setBlocks([]);
    // Reset all sprites to their original position/rotation when workspace is cleared
    setSprites((prevSprites) =>
      prevSprites.map((sprite) => ({
        ...sprite,
        x: 0,
        y: 0,
        rotation: 0,
        speechBubble: null,
        thoughtBubble: null,
      }))
    );
  }, []);

  // Reorder blocks - move a block to a new position
  const reorderBlock = useCallback((blockId, newIndex) => {
    setBlocks((prev) => {
      const spriteBlocks = prev.filter((b) => b.spriteId === selectedSpriteId);
      const otherBlocks = prev.filter((b) => b.spriteId !== selectedSpriteId);
      
      const blockToMove = spriteBlocks.find((b) => b.id === blockId);
      if (!blockToMove) {
        return prev;
      }
      
      const remainingBlocks = spriteBlocks.filter((b) => b.id !== blockId);
      const newBlocks = [...remainingBlocks];
      newBlocks.splice(newIndex, 0, blockToMove);
      
      return [...otherBlocks, ...newBlocks];
    });
  }, [selectedSpriteId]);

  // Hero Feature: Collision detection - check if two sprites are touching
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
  const spritesRef = useRef(sprites);
  const executedBlocksRef = useRef(new Map()); // Track executed blocks per sprite
  const collisionSwappedRef = useRef(new Set()); // Track sprites that have swapped in this execution cycle
  
  // Update refs when state changes
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);
  
  useEffect(() => {
    spritesRef.current = sprites;
  }, [sprites]);

  // Hero Feature: Swap blocks between two sprites when they collide
  const swapSpriteBlocks = useCallback((spriteId1, spriteId2) => {
    // Prevent multiple swaps in the same execution cycle
    const swapKey = [spriteId1, spriteId2].sort().join('_');
    if (collisionSwappedRef.current.has(swapKey)) {
      return; // Already swapped in this cycle
    }
    collisionSwappedRef.current.add(swapKey);

    setBlocks((prev) => {
      const sprite1Blocks = prev.filter((b) => b.spriteId === spriteId1);
      const sprite2Blocks = prev.filter((b) => b.spriteId === spriteId2);
      
      // If either sprite has no blocks, don't swap
      if (sprite1Blocks.length === 0 || sprite2Blocks.length === 0) {
        return prev;
      }
      
      // Create new blocks with swapped spriteIds (preserve block data, just swap ownership)
      // This effectively swaps the animations/behaviors between the two sprites
      const timestamp = Date.now();
      const newSprite1Blocks = sprite2Blocks.map((block, index) => ({
        ...block,
        id: `block_${timestamp}_1_${index}_${Math.random().toString(36).substr(2, 9)}`,
        spriteId: spriteId1,
      }));
      
      const newSprite2Blocks = sprite1Blocks.map((block, index) => ({
        ...block,
        id: `block_${timestamp}_2_${index}_${Math.random().toString(36).substr(2, 9)}`,
        spriteId: spriteId2,
      }));
      
      // Remove old blocks and add new swapped blocks
      const otherBlocks = prev.filter(
        (b) => b.spriteId !== spriteId1 && b.spriteId !== spriteId2
      );
      
      const newBlocks = [...otherBlocks, ...newSprite1Blocks, ...newSprite2Blocks];
      
      // Update ref synchronously so execution can pick up the new blocks immediately
      blocksRef.current = newBlocks;
      
      // Reset executed blocks for both sprites so they can execute their new blocks
      // This allows the swapped animations to continue executing
      executedBlocksRef.current.set(spriteId1, new Set());
      executedBlocksRef.current.set(spriteId2, new Set());
      
      return newBlocks;
    });
  }, []);

  const moveSteps = useCallback(async (steps, spriteId, currentState) => {
    // Move horizontally along x-axis (positive = right, negative = left)
    // Use functional update to get the latest sprite state
    setSprites((prev) => {
      const sprite = prev.find((s) => s.id === spriteId);
      if (!sprite) return prev;
      
      const newX = sprite.x + steps;
      const updated = prev.map((s) =>
        s.id === spriteId ? { ...s, x: newX } : s
      );
      
      // Hero Feature: Check for collisions after movement
      const movedSprite = updated.find((s) => s.id === spriteId);
      if (movedSprite) {
        for (const otherSprite of updated) {
          if (otherSprite.id !== spriteId && checkCollision(movedSprite, otherSprite)) {
            // Collision detected - swap animations (blocks)
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
      
      // Hero Feature: Check for collisions after movement
      const movedSprite = updated.find((s) => s.id === spriteId);
      if (movedSprite) {
        for (const otherSprite of updated) {
          if (otherSprite.id !== spriteId && checkCollision(movedSprite, otherSprite)) {
            // Collision detected - swap animations (blocks)
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
    // Get the latest sprite state from the ref to ensure we have current position
    const sprite = spritesRef.current?.find((s) => s.id === spriteId) || sprites.find((s) => s.id === spriteId);
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
        const sayMessage = block.message !== undefined ? block.message : "Hello!";
        const saySeconds = block.seconds || 2;
        // Only show speech bubble if message is not empty
        if (sayMessage) {
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
        }
        break;
      case "looks_think":
        const thinkMessage = block.message !== undefined ? block.message : "Hmm...";
        const thinkSeconds = block.seconds || 2;
        // Only show thought bubble if message is not empty
        if (thinkMessage) {
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
        }
        break;
      default:
        // Wait a bit for visual feedback
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }, [moveSteps, turnDegrees, gotoXY, sprites]);
  
  // Set the ref after the function is defined
  executeBlockRef.current = executeBlock;

  const executeBlocks = useCallback(async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    shouldStopRef.current = false;
    
    // Reset collision swap tracking
    collisionSwappedRef.current.clear();
    
    // Clear speech/thought bubbles but keep sprite positions
    setSprites((prev) =>
      prev.map((sprite) => ({
        ...sprite,
        speechBubble: null,
        thoughtBubble: null,
      }))
    );
    
    // Wait a bit for the update to take effect
    await new Promise((resolve) => setTimeout(resolve, 100));

    // CRITICAL FIX: Sync blocksRef with current blocks state
    blocksRef.current = blocks;

    // Initialize executed blocks tracking
    executedBlocksRef.current = new Map();
    sprites.forEach((sprite) => {
      executedBlocksRef.current.set(sprite.id, new Set());
    });

    // Execute all sprites simultaneously with collision detection
    const executeSprite = async (sprite) => {
      let maxExecutions = 200; // Safety limit
      let executionCount = 0;
      let consecutiveNoBlocks = 0; // Track consecutive iterations with no blocks
      
      while (executionCount < maxExecutions && !shouldStopRef.current) {
        // Get current blocks (may have changed due to collision swap)
        const spriteBlocks = blocksRef.current.filter((b) => b.spriteId === sprite.id);
        const executedIds = executedBlocksRef.current.get(sprite.id) || new Set();
        const blocksToExecute = spriteBlocks.filter(
          (b) => b.type !== "event_when_flag_clicked" && !executedIds.has(b.id)
        );
        
        // If no blocks to execute, check if we should continue (might have swapped blocks)
        if (blocksToExecute.length === 0) {
          consecutiveNoBlocks++;
          // If we've had no blocks for a few iterations, break
          // But allow some iterations in case blocks were just swapped
          if (consecutiveNoBlocks > 3) break;
          await new Promise((resolve) => setTimeout(resolve, 100));
          executionCount++;
          continue;
        }
        
        // Reset consecutive no blocks counter when we have blocks
        consecutiveNoBlocks = 0;
        
        // Execute blocks one by one
        for (const block of blocksToExecute) {
          if (shouldStopRef.current) break;
          
          // Get latest blocks in case of swap during execution
          const latestBlocks = blocksRef.current.filter((b) => b.spriteId === sprite.id);
          await executeBlock(block, latestBlocks, sprite.id);
          
          // Mark as executed (only if block still exists and belongs to this sprite)
          const currentExecuted = executedBlocksRef.current.get(sprite.id) || new Set();
          // Check if block still exists in current blocks (might have been swapped)
          const blockStillExists = blocksRef.current.some(
            (b) => b.id === block.id && b.spriteId === sprite.id
          );
          if (blockStillExists) {
            currentExecuted.add(block.id);
            executedBlocksRef.current.set(sprite.id, currentExecuted);
          }
          
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
    
    // Ensure sprite positions are preserved after execution
    // (They should already be preserved, but this is a safety check)
    setIsExecuting(false);
  }, [isExecuting, executeBlock, sprites, blocks]);

  const stopExecution = useCallback(() => {
    shouldStopRef.current = true;
    setIsExecuting(false);
    // Reset sprites to initial state
    setSprites((prev) =>
      prev.map((sprite) => ({
        ...sprite,
        speechBubble: null,
        thoughtBubble: null,
      }))
    );
  }, []);

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

  // Get blocks for selected sprite - memoized to ensure re-renders
  const selectedSpriteBlocks = React.useMemo(() => {
    return blocks.filter((b) => b.spriteId === selectedSpriteId);
  }, [blocks, selectedSpriteId]);
  const selectedSprite = sprites.find((s) => s.id === selectedSpriteId);

  const value = {
    blocks: selectedSpriteBlocks,
    allBlocks: blocks,
    getAllBlocks,
    addBlock,
    removeBlock,
    updateBlock,
    clearBlocks,
    reorderBlock,
    executeBlocks,
    stopExecution,
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
