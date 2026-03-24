import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Transformer } from "react-konva";

import Logo from "../../../assets/logo.webp";
import { useEngineStore, type Entity } from "@/store/engineStore";
import { useSelectionStore } from "@/store/useSelectionStore";
import Konva from "konva";

import { LocalTransformShow } from "./LocalTransform";
import { SpriteShow } from "./Sprite";
import { CameraShow } from "./Camera";

interface EntityProps extends Konva.NodeConfig {
  id: string;
  src: string;
  position: {
    x: number;
    y: number;
  };
  scale: {
    x: number;
    y: number;
  };
  rotation: number;
  onRegister: (id: string, node: any) => void;
  onClick: (id: string) => void;
}

const Entity = ({
  id,
  src,
  position,
  scale,
  rotation,
  onRegister,
  onClick,
  ...rest
}: EntityProps) => {
    const rectRef = useRef<Konva.Rect>(null);
    useEffect(() => {
        if (rectRef.current) {
            rectRef.current.getClientRect = () => {
                return { x: 0, y: 0, width: 0, height: 0 };
            };
        }
    }, []);

  return (
    <LocalTransformShow
      ref={(node) => {
        if (node) onRegister(id, node);
      }}
      id={id}
      x={position.x}
      y={position.y}
      scaleX={scale.x}
      scaleY={scale.y}
      rotation={rotation}
      draggable
      onClick={() => onClick(id)}
      lineColor="red"
      {...rest}
    >
      <SpriteShow src={src} />
      <CameraShow size={{ width: 200, height: 200 }} />
    </LocalTransformShow>
  );
};

function Displayer({
  width,
  height,
  entities,
}: {
  width: number;
  height: number;
  entities?: Entity[];
}) {
  const trRef = useRef<any>(null);
  const nodesRef = useRef<Map<string, any>>(new Map());

  const selectedId = useSelectionStore((state) => state.selectedEntityId);

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

  const handleSelection = (id: string) => {
    useSelectionStore.getState().selectEntity(id);
  };

  const handleDragEnd = (e: any) => {
    const node = e.target;
    const entityId = node.id();
    const sceneId = useSelectionStore.getState().selectedSceneId;
    if (!sceneId) return;

    const entity =
      useEngineStore.getState().scenes[sceneId]?.entities[entityId];
    if (!entity) return;

    const transformComponent = Object.values(entity.components).find(
      (c) => c.type === "localTransform",
    );
    if (!transformComponent) return;

    const posX = node.x();
    const posY = node.y();

    useEngineStore
      .getState()
      .updateComponentProps(sceneId, entityId, transformComponent.id || "", {
        position: { x: posX, y: posY },
      });
  };

  const handleTransformEnd = (e: any) => {
    const node = e.target;
    const entityId = node.id();
    const sceneId = useSelectionStore.getState().selectedSceneId;
    if (!sceneId) return;

    const entity =
      useEngineStore.getState().scenes[sceneId]?.entities[entityId];
    if (!entity) return;

    const transformComponent = Object.values(entity.components).find(
      (c) => c.type === "localTransform",
    );
    if (!transformComponent) return;

    useEngineStore
      .getState()
      .updateComponentProps(sceneId, entityId, transformComponent.id || "", {
        rotation: node.rotation(),
        scale: { x: node.scaleX(), y: node.scaleY() },
        position: { x: node.x(), y: node.y() },
      });
  };

  return (
    <Stage
      width={width}
      height={height}
      style={{ backgroundColor: "#ffffff" }}
      onMouseDown={(e) => {
        if (e.target === e.target.getStage()) {
          useSelectionStore.getState().selectEntity(null);
        }
      }}
    >
      <Layer>
        {entities?.map((entity) => {
          const transform = Object.values(entity.components).find(
            (c) => c.type === "localTransform",
          );
          return (
            <Entity
              key={entity.id || ""}
              id={entity.id || ""}
              src={Logo}
              position={transform?.props.position || { x: 0, y: 0 }}
              scale={transform?.props.scale || { x: 1, y: 1 }}
              rotation={transform?.props.rotation || 0}
              onClick={handleSelection}
              onRegister={addToRefs}
              onTransformEnd={handleTransformEnd}
              onDragEnd={handleDragEnd}
            />
          );
        })}
        {selectedId && <Transformer ref={trRef} flipEnabled={true} />}
      </Layer>
    </Stage>
  );
}
const EMPTY_ENTITIES = {};
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

  const currentSceneId = useSelectionStore((state) => state.selectedSceneId);
  const entities = useEngineStore((state) =>
    currentSceneId ? state.scenes[currentSceneId]?.entities : EMPTY_ENTITIES,
  );

  return (
    <div className="flex-1 w-full h-full min-h-0" ref={containerRef}>
      <Displayer
        width={dimensions.width}
        height={dimensions.height}
        entities={entities ? Object.values(entities) : []}
      />
    </div>
  );
}
