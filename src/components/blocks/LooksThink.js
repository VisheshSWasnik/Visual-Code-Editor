import React from "react";
import Block from "../common/Block";
import InputField from "../common/InputField";

export default function LooksThink({ 
  message, 
  seconds = 2,
  onChangeMessage,
  onChangeSeconds,
  isInWorkspace = false, 
  onDragStart 
}) {
  // Use message if provided, otherwise default to "Hmm..." for display only
  const displayMessage = message !== undefined ? message : "Hmm...";
  
  return (
    <Block
      type="looks_think"
      color="bg-scratch-purple"
      isDraggable={!isInWorkspace}
      onDragStart={onDragStart}
      className={`${isInWorkspace ? "cursor-default" : ""} flex-nowrap`}
    >
      <span className="font-medium whitespace-nowrap">think</span>
      <InputField
        value={displayMessage}
        onChange={onChangeMessage}
        placeholder="Hmm..."
        type="text"
        dynamicWidth={true}
      />
      <span className="font-medium whitespace-nowrap">for</span>
      <InputField
        value={seconds}
        onChange={onChangeSeconds}
        placeholder="2"
        dynamicWidth={true}
      />
      <span className="font-medium whitespace-nowrap">sec</span>
    </Block>
  );
}

