import { useEffect, useMemo, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Transformer,
  Rect,
  Circle,
  Group,
  Arc,
} from "react-konva";

import { useEngineStore, type Entity } from "@/store/engineStore";
import { useSelectionStore } from "@/store/useSelectionStore";
import Konva from "konva";

import { LocalTransformShow } from "./LocalTransform";
import { SpriteShow } from "./Sprite";
import { CameraShow } from "./Camera";
import { RenderableShapeShow } from "./RenderableShape";

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
  };
  camera?: {
    viewportSize: {
      x: number;
      y: number;
    };
  };
  renderable?: {
    color: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
    visible: boolean;
    layer: string;
    zindex: number;
    transparency: number;
    origin: {
      x: number;
      y: number;
    };
  };
  renderableShape?: {
    type: "rectangle" | "circle";
    "specs.width"?: number;
    "specs.height"?: number;
    "specs.radius"?: number;
    outlineColor: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
    outlineThickness: number;
  };
  collider?: {
    density: number;
    friction: number;
    restitution: number;
    rollingResistance: number;
    tangentSpeed: number;
    isSensor: boolean;
    enableContactEvents: boolean;
    enableSensorEvents: boolean;
    enableHitEvents: boolean;
  };
  circleCollider?: {
    radius: number;
    offset: {
      x: number;
      y: number;
    };
  };
  boxCollider?: {
    size: {
      x: number;
      y: number;
    };
  };
  capsuleCollider?: {
    center1: {
      x: number;
      y: number;
    };
    center2: {
      x: number;
      y: number;
    };
    radius: number;
  };

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
  collider,
  boxCollider,
  circleCollider,
  capsuleCollider,
  onRegister,
  onClick,
  ...rest
}: EntityProps) => {
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
      {renderable && sprite && (
        <SpriteShow
          src={sprite.texture}
          scale={sprite.scale}
          offset={renderable.origin}
        />
      )}
      {camera && <CameraShow size={camera.viewportSize} />}
      {renderable && renderableShape && (
        <RenderableShapeShow
          type={renderableShape.type}
          width={renderableShape["specs.width"]}
          height={renderableShape["specs.height"]}
          radius={renderableShape["specs.radius"]}
          origin={renderable.origin}
          fill={`rgba(${renderable.color.r}, ${renderable.color.g}, ${renderable.color.b}, ${renderable.color.a})`}
          stroke={`rgba(${renderableShape.outlineColor.r}, ${renderableShape.outlineColor.g}, ${renderableShape.outlineColor.b}, ${renderableShape.outlineColor.a})`}
          strokeWidth={renderableShape.outlineThickness}
        />
      )}
      {collider && boxCollider && (
        <Rect
          x={-10}
          y={-10}
          width={boxCollider.size.x}
          height={boxCollider.size.y}
          fill="lightblue"
          stroke="blue"
          strokeWidth={1}
        />
      )}
      {collider && circleCollider && (
        <Circle
          x={0}
          y={0}
          offsetX={circleCollider.offset.x}
          offsetY={circleCollider.offset.y}
          radius={circleCollider.radius}
          fill="lightgreen"
          stroke="green"
          strokeWidth={1}
        />
      )}
      {collider && capsuleCollider && (
        <Group>
          <Arc
            x={capsuleCollider.center1.x}
            y={capsuleCollider.center1.y}
            innerRadius={0}
            outerRadius={capsuleCollider.radius}
            angle={180}
            rotation={180} // demi-cercle du haut
            fill="lightcoral"
            stroke="red"
            strokeWidth={1}
          />
          <Rect
            x={capsuleCollider.center1.x - capsuleCollider.radius}
            y={capsuleCollider.center1.y}
            width={capsuleCollider.radius * 2}
            height={Math.abs(
              capsuleCollider.center2.y - capsuleCollider.center1.y,
            )}
            fill="lightcoral"
            stroke="red"
            strokeWidth={1}
          />
          <Arc
            x={capsuleCollider.center2.x}
            y={capsuleCollider.center2.y}
            innerRadius={0}
            outerRadius={capsuleCollider.radius}
            angle={180}
            rotation={0} // demi-cercle du bas
            fill="lightcoral"
            stroke="red"
            strokeWidth={1}
          />
        </Group>
      )}
    </LocalTransformShow>
  );
};

export function Displayer({
  width,
  height,
  entities,
  fromPrefabs,
}: {
  width: number;
  height: number;
  entities?: Entity[];
  fromPrefabs: boolean;
}) {
  const trRef = useRef<any>(null);
  const nodesRef = useRef<Map<string, any>>(new Map());

  const selectedId = useSelectionStore((state) => state.selectedEntityId);
  const sceneId = useSelectionStore((s) => s.selectedSceneId);

  const setLiveProp = useSessionStore((s) => s.setLiveProp);
  const updateComponentProps = useEngineStore((s) => s.updateComponentProps);
  const updateComponentPropsFromPrefab = useEngineStore(
    (s) => s.updateComponentPropsFromPrefab,
  );

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
    let entity = null;
    if (fromPrefabs) {
      entity = useEngineStore.getState().prefabs[selectedId!];
    } else {
      entity = useEngineStore.getState().scenes[sceneId]?.entities[selectedId!];
    }
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
    if (fromPrefabs) {
      useSelectionStore.getState().selectType("prefab");
    } else {
      useSelectionStore.getState().selectType("entity");
    }
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

    let entity = null;
    if (fromPrefabs) {
      entity = useEngineStore.getState().prefabs[id];
    } else {
      entity = useEngineStore.getState().scenes[sceneId]?.entities[id];
    }
    if (!entity) return;

    const transformId = Object.values(entity?.components || {}).find(
      (c) => c.type === "localtransform",
    )?.id;
    if (!transformId) return;

    const props = {
      position: { x: Math.floor(node.x()), y: Math.floor(node.y()) },
    };

    if (isEnd) {
      if (fromPrefabs) {
        updateComponentPropsFromPrefab(id, transformId, props);
      } else {
        updateComponentProps(sceneId, id, transformId, props);
      }
      return;
    }
    setLiveProp(id, transformId, props);
  };

  const handleTransform = (e: any, isEnd: boolean) => {
    const node = e.target;
    const id = node.id();
    if (!sceneId) return;

    let entity = null;
    if (fromPrefabs) {
      entity = useEngineStore.getState().prefabs[id];
    } else {
      entity = useEngineStore.getState().scenes[sceneId]?.entities[id];
    }
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
      if (fromPrefabs) {
        updateComponentPropsFromPrefab(id, transformId, {
          position: { x: Math.floor(node.x()), y: Math.floor(node.y()) },
          ...props,
        });
      } else {
        updateComponentProps(sceneId, id, transformId, {
          position: { x: Math.floor(node.x()), y: Math.floor(node.y()) },
          ...props,
        });
      }
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
      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded select-none pointer-events-none">
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
  const renderableShape = allProps["renderableshape"] || undefined;
  const collider = allProps["collider"] || undefined;
  const boxcollider = allProps["boxcollider"] || undefined;
  const circlecollider = allProps["circlecollider"] || undefined;
  const capsulecollider = allProps["capsulecollider"] || undefined;

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
      collider={collider}
      boxCollider={boxcollider}
      circleCollider={circlecollider}
      capsuleCollider={capsulecollider}
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
    const { width, height } = container.getBoundingClientRect();
    if (width > 0 && height > 0) setDimensions({ width, height });

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      if (rect.width === 0 || rect.height === 0) return;
      setDimensions({ width: rect.width, height: rect.height });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const currentSceneId = useSelectionStore((state) => state.selectedSceneId);
  const entities = useEngineStore((state) =>
    currentSceneId ? state.scenes[currentSceneId]?.entities : EMPTY_ENTITIES,
  );

  // const entitiesArray = entities ? Object.values(entities) : [];
  // if (entitiesArray) entitiesArray.reverse();
  const entitiesArray = entities
    ? Object.values(entities).sort((a, b) => {
        const getZindex = (entity: Entity): number | null => {
          const renderableComp = Object.values(entity.components).find(
            (c) => c.type === "renderable",
          );
          if (!renderableComp) return null;
          const zindex = renderableComp.props?.zindex;
          return zindex !== undefined ? Number(zindex) : 0;
        };

        const aZindex = getZindex(a as Entity);
        const bZindex = getZindex(b as Entity);
        if (aZindex === null && bZindex === null) return 0;
        if (aZindex === null) return -1;
        if (bZindex === null) return 1;
        return aZindex - bZindex;
      })
    : [];

  return (
    <div className="flex-1 w-full h-full min-h-0" ref={containerRef}>
      <Displayer
        width={dimensions.width}
        height={dimensions.height}
        entities={entitiesArray as Entity[]}
        fromPrefabs={false}
      />
    </div>
  );
}
