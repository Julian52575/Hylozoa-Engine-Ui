import { forwardRef, useEffect, useState } from "react";
import Konva from "konva";
import { Image } from "react-konva";
import { convertFileSrc } from "@tauri-apps/api/core"; // Pour Tauri v2

interface SpriteProps extends Konva.ImageConfig {
  src: string;
  scale?: { x: number; y: number };
  origin?: { x: number; y: number };
  originType?: "center" | "top-left";
}

export const SpriteShow = forwardRef<Konva.Image, SpriteProps>(
  (
    {
      src,
      scale = { x: 1, y: 1 },
      origin = { x: 0, y: 0 },
      originType = "center",
      ...rest
    },
    ref,
  ) => {
    const [img, setImg] = useState<HTMLImageElement | undefined>(undefined);
    const [calculatedSize, setCalculatedSize] = useState({
      width: 0,
      height: 0,
    });

    useEffect(() => {
      const assetUrl = src.startsWith("http") ? src : convertFileSrc(src);
      const image = new window.Image();
      image.src = assetUrl;
      image.onload = () => {
        setImg(image);
        setCalculatedSize({ width: image.width, height: image.height });
      };
    }, [src]);

    if (!img) {
      return null;
    }

    return (
      <Image
        image={img}
        width={calculatedSize.width}
        height={calculatedSize.height}
        scaleX={scale.x}
        scaleY={scale.y}
        offsetX={
          originType === "center"
            ? calculatedSize.width / 2 + origin.x
            : origin.x
        }
        offsetY={
          originType === "center"
            ? calculatedSize.height / 2 + origin.y
            : origin.y
        }
        ref={ref}
        {...rest}
      />
    );
  },
);

SpriteShow.displayName = "SpriteShow";
