import React from "react";
import Block from "../common/Block";
import InputField from "../common/InputField";

export default function MotionGotoXY({
  x = 0,
  y = 0,
  onXChange,
  onYChange,
  isInWorkspace = false,
  onDragStart,
}) {
  return (
    <Block
      type="motion_goto_xy"
      color="bg-scratch-blue"
      isDraggable={!isInWorkspace}
      onDragStart={onDragStart}
      className={`${isInWorkspace ? "cursor-default" : ""} flex-nowrap`}
    >
      <span className="font-medium whitespace-nowrap">go to x:</span>
      <InputField
        value={x}
        onChange={onXChange}
        placeholder="0"
        dynamicWidth={true}
      />
      <span className="font-medium whitespace-nowrap">y:</span>
      <InputField
        value={y}
        onChange={onYChange}
        placeholder="0"
        dynamicWidth={true}
      />
    </Block>
  );
}

