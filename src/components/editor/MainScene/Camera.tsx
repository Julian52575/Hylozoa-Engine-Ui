import { useEffect, useRef } from "react";
import Konva from "konva";
import { Rect } from "react-konva";

interface SpriteProps extends Konva.RectConfig {
  offsetType?: "center" | "top-left";
  size: {
    x: number;
    y: number;
  };
  color?: string;
  listening?: boolean;
}

export function CameraShow({
  size,
  color = "blue",
  listening = false,
  offsetType = "center",
  ...rest
}: SpriteProps) {
  const rectRef = useRef<Konva.Rect>(null);
  useEffect(() => {
    if (rectRef.current) {
      rectRef.current.getClientRect = () => {
        return { x: 0, y: 0, width: 0, height: 0 };
      };
    }
  }, []);

  return (
    <Rect
      ref={rectRef}
      width={size.x}
      height={size.y}
      offsetX={offsetType === "center" ? size.x / 2 : 0}
      offsetY={offsetType === "center" ? size.y / 2 : 0}
      stroke={color}
      strokeWidth={1}
      listening={listening}
      {...rest}
    />
  );
}

CameraShow.displayName = "CameraShow";
