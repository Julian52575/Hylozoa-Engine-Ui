import { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Transformer } from "react-konva";

import Logo from "../../../assets/logo.webp";
import { useEngineStore, type Entity } from "@/store/engineStore";
import { useSelectionStore } from "@/store/useSelectionStore";
import Konva from "konva";

import { LocalTransformShow } from "./LocalTransform";
import { SpriteShow } from "./Sprite";
import { CameraShow } from "./Camera";
import { useSessionStore } from "@/store/useSessionStore";

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
  const sceneId = useSelectionStore((s) => s.selectedSceneId);

  const setLiveProp = useSessionStore((s) => s.setLiveProp);
  const clearOverrides = useSessionStore((s) => s.clearOverrides);
  const updateComponentProps = useEngineStore((s) => s.updateComponentProps);

  const addToRefs = (id: string, node: any) => {
    if (node) {
      nodesRef.current.set(id, node);
    } else {
      nodesRef.current.delete(id);
    }
  };
  useEffect(() => {
    if (selectedId && trRef.current && nodesRef.current.has(selectedId)) {
      trRef.current.nodes([nodesRef.current.get(selectedId)]);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedId]);

  const handleSelection = (id: string) => {
    useSelectionStore.getState().selectEntity(id);
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();

    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const speed = 1.1;
    const newScale = e.evt.deltaY > 0 ? oldScale / speed : oldScale * speed;

    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
  };

  const handleDrag = (e: any, isEnd: boolean) => {
    const node = e.target;
    const id = node.id();
    if (!sceneId) return;

    const entity = useEngineStore.getState().scenes[sceneId]?.entities[id];
    if (!entity) return;

    const transformId = Object.values(entity?.components || {}).find(
      (c) => c.type === "localTransform",
    )?.id;
    if (!transformId) return;

    const props = { position: { x: node.x(), y: node.y() } };

    if (isEnd) {
      updateComponentProps(sceneId, id, transformId, props);
      clearOverrides();
      return;
    }
    setLiveProp(id, transformId, props);
  };


  const handleTransform = (e: any, isEnd: boolean) => {
    const node = e.target;
    const id = node.id();
    if (!sceneId) return;

    const entity = useEngineStore.getState().scenes[sceneId]?.entities[id];
    if (!entity) return;

    const transformId = Object.values(entity?.components || {}).find(
      (c) => c.type === "localTransform",
    )?.id;
    if (!transformId) return;

    const rawRotation = node.rotation();
    const normalizedRotation = Math.floor(((rawRotation % 360) + 360) % 360);
    const props = {
      position: { x: node.x(), y: node.y() },
      rotation: normalizedRotation,
      scale: { x: node.scaleX(), y: node.scaleY() },
    };

    if (isEnd) {
      updateComponentProps(sceneId, id, transformId, props);
      clearOverrides();
      return;
    }
    setLiveProp(id, transformId, props);
  };

  return (
    <Stage
      width={width}
      height={height}
      draggable
      onWheel={handleWheel}
      style={{ backgroundColor: "#242424" }}
      onMouseUp={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "default";
      }}
      onMouseDown={(e) => {
        const stage = e.target.getStage();
        if (e.target === stage) {
          useSelectionStore.getState().selectEntity(null);
        }
        if (stage) stage.container().style.cursor = "grabbing";
      }}
    >
      <Layer>
        {entities?.map((entity) => (
          <ConnectedEntity
            key={entity.id || ""}
            entity={entity}
            onRegister={addToRefs}
            onClick={handleSelection}
            onDragMove={(e: any) => handleDrag(e, false)}
            onDragEnd={(e: any) => handleDrag(e, true)}
            onTransform={(e: any) => handleTransform(e, false)}
            onTransformEnd={(e: any) => handleTransform(e, true)}
          />
        ))}
        {selectedId && <Transformer ref={trRef} flipEnabled={true} />}
      </Layer>
    </Stage>
  );
}

interface ConnectedEntityProps extends Konva.NodeConfig {
  entity: Entity;
  onRegister: (id: string, node: any) => void;
  onClick: (id: string) => void;
}

const EMPTY_OBJECT = {};
function ConnectedEntity({ entity, ...props }: ConnectedEntityProps) {
  const liveOverrides = useSessionStore(
    (s) => s.overrides[entity.id!] || EMPTY_OBJECT,
  );

  const allProps = useMemo(() => {
    const result: Record<string, any> = {};
    Object.values(entity.components).forEach((comp) => {
      const overrides = liveOverrides[comp.id!] || EMPTY_OBJECT;

      result[comp.type] = {
        ...comp.props,
        ...overrides,
      };
    });

    return result;
  }, [entity.components, liveOverrides]);

  const transform = allProps["localTransform"] || {};

  return (
    <Entity
      id={entity.id || ""}
      src={Logo}
      position={transform.position || { x: 0, y: 0 }}
      scale={transform.scale || { x: 1, y: 1 }}
      rotation={transform.rotation || 0}
      {...props}
    />
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
