import { forwardRef} from "react";
import Konva from "konva";
import { Rect, Circle } from "react-konva";

interface RenderableShapeProps extends Konva.RectConfig, Konva.CircleConfig {
  type: string;
  originX: number;
  originY: number;
  width?: number;
  height?: number;
  radius?: number;
}

export const RenderableShapeShow = forwardRef<
  Konva.Rect | Konva.Circle,
  RenderableShapeProps
>(({ type, originX, originY,width, height, radius, ...rest }, ref) => {

  if (type === "rectangle") {
    return (
      <Rect
        ref={ref as React.ForwardedRef<Konva.Rect>}
        {...rest}
        x={originX}
        y={originY}
        width={width}
        height={height}
        offsetX={width / 2}
        offsetY={height / 2}
        strokeScaleEnabled={false}
      />
    );
  }

  if (type === "circle") {
    return (
      <Circle
        ref={ref as React.ForwardedRef<Konva.Circle>}
        {...rest}
        radius={radius}
        strokeScaleEnabled={false}
      />
    );
  }

  return null;
});

RenderableShapeShow.displayName = "RenderableShapeShow";
