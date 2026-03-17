import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Transformer, Image } from "react-konva";

import Logo from "../../assets/logo.webp";

interface EntityProps {
  id: string;
  src: string;
  position: {
    x: number;
    y: number;
  };
  transform?: {
    scale?: {
      x: number;
      y: number;
    };
    rotation?: number;
  };
  size: {
    width: number;
    height: number;
  };
  onClick: (id: string) => void;
  onRegister: (id: string, node: any) => void;
}

const Entity = ({
  id,
  src,
  position,
  size,
  transform,
  onClick,
  onRegister,
}: EntityProps) => {
  const [img, setImg] = useState<HTMLImageElement | undefined>(undefined);

  useEffect(() => {
    const image = new window.Image();
    image.src = src;
    image.onload = () => setImg(image);
  }, [src]);

  return (
    <Image
      ref={(node) => onRegister(id, node)}
      id={id}
      x={position.x}
      y={position.y}
      rotation={transform?.rotation || 0}
      scaleX={transform?.scale?.x || 1}
      scaleY={transform?.scale?.y || 1}
      width={size.width}
      height={size.height}
      image={img}
      draggable
      onClick={() => onClick(id)}
    />
  );
};

export function MainScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setDimensions({
        width: rect.width,
        height: rect.height,
      });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const trRef = useRef<any>(null);
  const nodesRef = useRef<Map<string, any>>(new Map());

  const addToRefs = (id: string, node: any) => {
    if (node) {
      nodesRef.current.set(id, node);
    } else {
      nodesRef.current.delete(id);
    }
  };
  useEffect(() => {
    if (selectedId) {
      trRef.current.nodes([nodesRef.current.get(selectedId)]);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedId]);


  return (
    <div className="flex-1 w-full h-full min-h-0" ref={containerRef}>
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        style={{ backgroundColor: "#ffffff" }}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) {
            setSelectedId(null);
          }
        }}
      >
        <Layer>
           <Entity
            id="logo"
             src={Logo}
             position={{ x: 50, y: 200 }}
             size={{ width: 100, height: 100 }}
             onClick={setSelectedId}
             onRegister={addToRefs}
           />
          {selectedId && <Transformer ref={trRef} />}
        </Layer>
      </Stage>
    </div>
  );
}
