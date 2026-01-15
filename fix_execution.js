// Script to fix BlockContext.js execution issues
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'context', 'BlockContext.js');
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Add swapTimesRef
content = content.replace(
  /const executedBlocksRef = useRef\(new Map\(\)\); \/\/ Track executed blocks per sprite\s*\n\s*\/\/ Update ref when blocks change/,
  `const executedBlocksRef = useRef(new Map()); // Track executed blocks per sprite
  const swapTimesRef = useRef(new Map()); // Track swap times to prevent infinite loops
  
  // Update ref when blocks change`
);

// Fix 2: Add throttling to swapSpriteBlocks
content = content.replace(
  /const swapSpriteBlocks = useCallback\(\(spriteId1, spriteId2\) => \{/,
  `const swapSpriteBlocks = useCallback((spriteId1, spriteId2) => {
    // Throttle swaps - only allow one swap per pair every 1000ms
    const swapKey = \`\${Math.min(spriteId1, spriteId2)}_\${Math.max(spriteId1, spriteId2)}\`;
    const now = Date.now();
    const lastSwapTime = swapTimesRef.current.get(swapKey) || 0;
    
    if (now - lastSwapTime < 1000) {
      return; // Too soon, skip swap
    }
    
    swapTimesRef.current.set(swapKey, now);
    
    `
);

// Fix 3: Fix executeBlocks - add try/catch, sync blocksRef, add blocks to deps
content = content.replace(
  /const executeBlocks = useCallback\(async \(\) => \{\s*if \(isExecuting\) return;\s*setIsExecuting\(true\);\s*\/\/ Reset all sprites/,
  `const executeBlocks = useCallback(async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    
    try {
      // CRITICAL FIX: Sync blocksRef with current blocks state at start
      blocksRef.current = blocks;
      
      // Reset swap tracking
      swapTimesRef.current.clear();
      
      // Reset all sprites`
);

// Fix 4: Wrap execution end in finally
content = content.replace(
  /\/\/ Wait for all sprites to finish\s*await Promise\.all\(executionPromises\);\s*setIsExecuting\(false\);\s*\}, \[isExecuting, executeBlock, sprites\]\);/,
  `// Wait for all sprites to finish with timeout
      await Promise.race([
        Promise.all(executionPromises),
        new Promise((resolve) => setTimeout(resolve, 30000)) // 30 second timeout
      ]);
      
    } catch (error) {
      console.error("Execution error:", error);
    } finally {
      // Always set executing to false
      setIsExecuting(false);
    }
  }, [isExecuting, executeBlock, sprites, blocks]);`
);

// Fix 5: Add logging to execution
content = content.replace(
  /if \(!startBlock\) return Promise\.resolve\(\);/,
  `if (!startBlock) {
        console.log(\`[Execute] No start block for sprite \${sprite.name} (\${sprite.id}). Blocks found: \${spriteBlocks.length}\`);
        return Promise.resolve();
      }
      console.log(\`[Execute] Starting sprite \${sprite.name} (\${sprite.id}) with \${spriteBlocks.length} blocks\`);`
);

content = content.replace(
  /if \(blocksToExecute\.length === 0\) break;/,
  `if (blocksToExecute.length === 0) {
          console.log(\`[Execute] No more blocks to execute for sprite \${sprite.name}\`);
          break;
        }
        console.log(\`[Execute] Sprite \${sprite.name} executing \${blocksToExecute.length} blocks\`);`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed BlockContext.js');

