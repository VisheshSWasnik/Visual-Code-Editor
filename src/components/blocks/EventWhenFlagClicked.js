import React from "react";
import HatBlock from "../common/HatBlock";

export default function EventWhenFlagClicked({ isInWorkspace = false, onDragStart }) {
  return (
    <HatBlock
      color="bg-scratch-yellow"
      isDraggable={!isInWorkspace}
      onDragStart={onDragStart}
      className={isInWorkspace ? "cursor-default" : ""}
    >
      <span className="font-medium">when</span>
      <svg
        className="mx-1.5"
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Flag pole */}
        <line x1="3" y1="2" x2="3" y2="16" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" />
        {/* Flag triangle */}
        <path
          d="M3 3L13 3L11 7L13 11L3 11Z"
          fill="#22C55E"
        />
      </svg>
      <span className="font-medium">clicked</span>
    </HatBlock>
  );
}

