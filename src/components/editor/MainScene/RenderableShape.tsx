import { forwardRef} from "react";
import Konva from "konva";
import { Rect, Circle } from "react-konva";

interface RenderableShapeProps extends Konva.RectConfig, Konva.CircleConfig {
  type: string;
  origin?: {
    x: number;
    y: number;
  };
  width?: number;
  height?: number;
  radius?: number;
}

export const RenderableShapeShow = forwardRef<
  Konva.Rect | Konva.Circle,
  RenderableShapeProps
>(({ type, origin, width, height, radius, ...rest }, ref) => {

  if (type === "rectangle") {
    return (
      <Rect
        ref={ref as React.ForwardedRef<Konva.Rect>}
        {...rest}
        width={width}
        height={height}
        offsetX={origin?.x * width}
        offsetY={origin?.y * height}
        strokeScaleEnabled={false}
      />
    );
  }

  if (type === "circle") {
    const offsetX = origin ? (origin.x - 0.5) * (radius * 2) : 0;
    const offsetY = origin ? (origin.y - 0.5) * (radius * 2) : 0;
    return (
      <Circle
        ref={ref as React.ForwardedRef<Konva.Circle>}
        {...rest}
        radius={radius}
        offsetX={offsetX}
        offsetY={offsetY}
        strokeScaleEnabled={false}
      />
    );
  }

  return null;
});

RenderableShapeShow.displayName = "RenderableShapeShow";
