/**
 * Utility function to create a block from a block type
 * Used by both MidArea and WorkspaceBlock to ensure consistency
 */
export const createBlockFromType = (blockType, extraData = {}) => {
  const id = `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const baseBlock = {
    id,
    type: blockType,
    nextBlockId: null,
  };

  switch (blockType) {
    case "motion_move_steps":
      return { ...baseBlock, value: 10 };
    case "motion_turn_degrees":
      return { ...baseBlock, value: 15, direction: extraData.direction || "clockwise" };
    case "motion_goto_xy":
      return { ...baseBlock, x: 0, y: 0 };
    case "control_repeat":
      return { ...baseBlock, value: 10, innerBlocks: [] };
    case "looks_say":
      return { ...baseBlock, message: "Hello!", seconds: 2 };
    case "looks_think":
      return { ...baseBlock, message: "Hmm...", seconds: 2 };
    default:
      return baseBlock;
  }
};

