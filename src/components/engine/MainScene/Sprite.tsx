import { forwardRef, useEffect, useState } from "react";
import Konva from "konva";
import { Image } from "react-konva";
import { getAssetUrl, resolveAssetPath } from "@/lib/utils";
interface SpriteProps extends Konva.ImageConfig {
  src: string | null;
  scale?: { x: number; y: number };
  offset?: { x: number; y: number };
}

export const SpriteShow = forwardRef<Konva.Image, SpriteProps>(
  ({ src, scale = { x: 1, y: 1 }, offset = { x: 0, y: 0 }, ...rest }, ref) => {
    const [img, setImg] = useState<HTMLImageElement | undefined>(undefined);
    const [calculatedSize, setCalculatedSize] = useState({
      width: 0,
      height: 0,
    });

    useEffect(() => {
      if (!src) {
        setImg(undefined);
        setCalculatedSize({ width: 0, height: 0 });
        return;
      }
      const loadImage = async () => {
        const finalPath = await resolveAssetPath(src,'Assets');
        if (!finalPath) return;

        const image = new window.Image();
        image.src = getAssetUrl(finalPath);
        image.onload = () => {
          setImg(image);
          setCalculatedSize({ width: image.width, height: image.height });
        };
        image.onerror = () => {
          console.error("Failed to load image:", finalPath);
          setImg(undefined);
          setCalculatedSize({ width: 0, height: 0 });
        };
      };
      loadImage();
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
        offsetX={calculatedSize.width * offset.x}
        offsetY={calculatedSize.height * offset.y}
        ref={ref}
        {...rest}
      />
    );
  },
);

SpriteShow.displayName = "SpriteShow";
