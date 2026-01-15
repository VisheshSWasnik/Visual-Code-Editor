import React from "react";
import Block from "../common/Block";
import InputField from "../common/InputField";
import Icon from "../Icon";

export default function MotionTurnDegrees({
  value = 15,
  onChange,
  direction = "clockwise", // "clockwise" or "counterclockwise"
  isInWorkspace = false,
  onDragStart,
}) {
  return (
    <Block
      type="motion_turn_degrees"
      color="bg-scratch-blue"
      isDraggable={!isInWorkspace}
      onDragStart={onDragStart}
      className={isInWorkspace ? "cursor-default" : ""}
    >
      <span className="font-medium">turn</span>
      <Icon
        name={direction === "clockwise" ? "redo" : "undo"}
        size={16}
        className="text-white mx-0.5"
      />
      <InputField
        value={value}
        onChange={onChange}
        placeholder="15"
        dynamicWidth={true}
      />
      <span className="font-medium">degrees</span>
    </Block>
  );
}

