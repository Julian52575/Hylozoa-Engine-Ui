import { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Transformer, Rect } from "react-konva";

import { useEngineStore, type Entity } from "@/store/engineStore";
import { useSelectionStore } from "@/store/useSelectionStore";
import Konva from "konva";

import { LocalTransformShow } from "./LocalTransform";
import { SpriteShow } from "./Sprite";
import { CameraShow } from "./Camera";
import { useSessionStore } from "@/store/useSessionStore";

interface EntityProps extends Konva.NodeConfig {
  id: string;
  transform: {
    position: {
      x: number;
      y: number;
    };
    scale: {
      x: number;
      y: number;
    };
    rotation: number;
  };
  sprite?: {
    texture: string;
    scale: {
      x: number;
      y: number;
    };
    offset: {
      x: number;
      y: number;
    };
    camera?: {
      viewportSize: {
        x: number;
        y: number;
      };
    };
  };
  renderable?: any;
  renderableShape?: any;

  onRegister: (id: string, node: any) => void;
  onClick: (id: string) => void;
}

const Entity = ({
  id,
  transform,
  sprite,
  camera,
  renderable,
  renderableShape,
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
      x={transform.position.x}
      y={transform.position.y}
      scaleX={transform.scale.x}
      scaleY={transform.scale.y}
      rotation={transform.rotation}
      draggable
      onClick={() => onClick(id)}
      lineColor="red"
      {...rest}
    >
      {sprite && (
        <SpriteShow
          src={sprite.texture}
          scale={sprite.scale}
          offset={sprite.offset}
        />
      )}
      {camera && <CameraShow size={camera.viewportSize} />}
      {renderable &&
        renderableShape &&
        renderableShape.shapeType === "rectangle" && (
          <Rect
            ref={rectRef}
            width={renderableShape.specs.width}
            height={renderableShape.specs.height}
            fill={`rgba(${renderable.color.r}, ${renderable.color.g}, ${renderable.color.b}, ${renderable.color.a})`}
            offsetX={renderable.origin.x + renderableShape.specs.width / 2}
            offsetY={renderable.origin.y + renderableShape.specs.height / 2}
            stroke={`rgba(${renderableShape.outlineColor.r}, ${renderableShape.outlineColor.g}, ${renderableShape.outlineColor.b}, ${renderableShape.outlineColor.a})`}
            strokeWidth={renderableShape.outlineThickness}
            strokeScaleEnabled={false}
          />
        )}
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
  const updateComponentProps = useEngineStore((s) => s.updateComponentProps);

  const [viewInfo, setViewInfo] = useState({
    x: 0,
    y: 0,
    zoom: 1,
  });
  const stageRef = useRef<any>(null);

  const updateViewInfo = () => {
    const stage = stageRef.current;
    if (!stage) return;

    const zoom = Number(stage.scaleX().toFixed(2));
    const centerWorldX = (stage.width() / 2 - stage.x()) / zoom;
    const centerWorldY = (stage.height() / 2 - stage.y()) / zoom;

    setViewInfo({
      x: Math.round(centerWorldX),
      y: Math.round(centerWorldY),
      zoom: zoom,
    });
  };

  const addToRefs = (id: string, node: any) => {
    if (node) {
      nodesRef.current.set(id, node);
    } else {
      nodesRef.current.delete(id);
    }
  };
  useEffect(() => {
    if (!sceneId) return;
    const entity =
      useEngineStore.getState().scenes[sceneId]?.entities[selectedId!];
    if (!entity) return;
    const transformComp = Object.values(entity.components).find(
      (c) => c.type === "localtransform",
    );
    if (!transformComp) return;

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
      (c) => c.type === "localtransform",
    )?.id;
    if (!transformId) return;

    const props = {
      position: { x: Math.floor(node.x()), y: Math.floor(node.y()) },
    };

    if (isEnd) {
      updateComponentProps(sceneId, id, transformId, props);
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
      (c) => c.type === "localtransform",
    )?.id;
    if (!transformId) return;

    const rawRotation = node.rotation();
    const normalizedRotation = Math.floor(((rawRotation % 360) + 360) % 360);
    const props = {
      rotation: normalizedRotation,
      scale: { x: node.scaleX(), y: node.scaleY() },
    };

    if (isEnd) {
      updateComponentProps(sceneId, id, transformId, {
        position: { x: Math.floor(node.x()), y: Math.floor(node.y()) },
        ...props,
      });
      return;
    }
    setLiveProp(id, transformId, props);
  };

  return (
    <div className="relative w-full h-full">
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        draggable
        onWheel={(e) => {
          handleWheel(e);
          updateViewInfo();
        }}
        onDragMove={updateViewInfo}
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
      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {`x: ${viewInfo.x} y: ${viewInfo.y} zoom: ${viewInfo.zoom}x`}
      </div>
    </div>
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

  const renderable = allProps["renderable"] || undefined;
  const transform = allProps["localtransform"] || undefined;
  const sprite = allProps["sprite"] || undefined;
  const camera = allProps["camera"] || undefined;
  const renderableShape = allProps["renderableShape"] || undefined;

  if (transform === undefined) {
    return null;
  }

  return (
    <Entity
      id={entity.id || ""}
      sprite={sprite}
      transform={transform}
      camera={camera}
      renderable={renderable}
      renderableShape={renderableShape}
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
