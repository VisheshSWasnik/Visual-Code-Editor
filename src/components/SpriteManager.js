import React from "react";
import { useBlocks } from "../context/BlockContext";

export default function SpriteManager() {
  const { sprites, selectedSpriteId, selectSprite, addSprite, removeSprite } = useBlocks();

  return (
    <div className="p-2 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-gray-700 text-sm">Sprites</h3>
        <button
          onClick={addSprite}
          className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors"
        >
          + Add Sprite
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {sprites.map((sprite) => (
          <div
            key={sprite.id}
            className={`px-3 py-1 rounded cursor-pointer text-sm flex items-center gap-2 ${
              selectedSpriteId === sprite.id
                ? "bg-blue-500 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => selectSprite(sprite.id)}
          >
            <span>{sprite.name}</span>
            {sprites.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeSprite(sprite.id);
                }}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

