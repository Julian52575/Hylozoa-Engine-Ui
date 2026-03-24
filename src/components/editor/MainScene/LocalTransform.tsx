import React, { forwardRef } from "react";
import Konva from "konva";
import { Group, Circle, Line } from "react-konva";

interface LocalTransformShowProps extends Konva.GroupConfig {
  lineLength?: number;
  lineColor?: string;
  lineWidth?: number;
  children?: React.ReactNode;
}

export const LocalTransformShow = forwardRef<
  Konva.Group,
  LocalTransformShowProps
>(
  (
    { lineLength = 20, lineColor = "blue", lineWidth = 2, children, ...rest },
    ref,
  ) => {
    return (
      <Group ref={ref} {...rest}>
        {children}
        <Circle radius={3} fill={lineColor} opacity={0.5} />
        <Line
          points={[-lineLength / 2, 0, lineLength / 2, 0]}
          stroke={lineColor}
          strokeWidth={lineWidth}
          opacity={0.7}
        />
        <Line
          points={[0, -lineLength / 2, 0, lineLength / 2]}
          stroke={lineColor}
          strokeWidth={lineWidth}
          opacity={0.7}
        />
      </Group>
    );
  },
);

LocalTransformShow.displayName = "LocalTransformShow";
