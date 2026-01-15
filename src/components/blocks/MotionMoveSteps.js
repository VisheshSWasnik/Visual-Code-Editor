import React from "react";
import Block from "../common/Block";
import InputField from "../common/InputField";

export default function MotionMoveSteps({ value = 10, onChange, isInWorkspace = false, onDragStart }) {
  return (
    <Block
      type="motion_move_steps"
      color="bg-scratch-blue"
      isDraggable={!isInWorkspace}
      onDragStart={onDragStart}
      className={isInWorkspace ? "cursor-default" : ""}
    >
      <span className="font-medium">move</span>
      <InputField
        value={value}
        onChange={onChange}
        placeholder="10"
        dynamicWidth={true}
      />
      <span className="font-medium">steps</span>
    </Block>
  );
}

