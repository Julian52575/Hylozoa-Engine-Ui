import { forwardRef, useEffect, useState } from "react";
import Konva from "konva";
import { Image } from "react-konva";

interface SpriteProps extends Konva.ImageConfig {
  src: string;
  offsetType?: "center" | "top-left";
}

export const SpriteShow = forwardRef<Konva.Image, SpriteProps>(
  ({ src, offsetType = "center", ...rest }, ref) => {
    const [img, setImg] = useState<HTMLImageElement | undefined>(undefined);
    const [calculatedSize, setCalculatedSize] = useState({
      width: 0,
      height: 0,
    });
    useEffect(() => {
      const image = new window.Image();
      image.src = src;
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
        offsetX={offsetType === "center" ? calculatedSize.width / 2 : 0}
        offsetY={offsetType === "center" ? calculatedSize.height / 2 : 0}
        ref={ref}
        {...rest}
      />
    );
  },
);

SpriteShow.displayName = "SpriteShow";