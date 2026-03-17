import { Vector2Option } from "./Vector2Option";
import { EnumOption } from "./EnumOption";
import { BooleanOption } from "./BooleanOption";
import { TextOption } from "./TextOption";
import { NumberOption } from "./NumberOption";
import IconDisplayer from "../IconDisplayer";

import { useSelectionStore } from "@/store/useSelectionStore";
import { useEngineStore } from "@/store/engineStore";
import { useSchemaStore } from "@/store/useSchemaStore";

function DisplayProposal({
  propConfig,
  value,
}: {
  propConfig: any;
  value: any;
}) {
  const { type, label, default: defaultValue, options } = propConfig;

  switch (type) {
    case "vector2":
      return (
        <Vector2Option label={label} x={value.x} y={value.y} linked={true} />
      );
    case "enum":
      return (
        <EnumOption
          label={label}
          options={options || []}
          defaultValue={defaultValue}
        />
      );
    case "boolean":
      return <BooleanOption label={label} checked={defaultValue} />;
    case "text":
      return <TextOption label={label} value={defaultValue} />;
    case "number":
      return <NumberOption label={label} value={value} />;
    default:
      return null;
  }
}

export function Inspector() {
  const selectedEntityId = useSelectionStore((state) => state.selectedEntityId);
  const componentId = useSelectionStore((state) => state.selectedComponentId);
  const currentSceneId = useEngineStore((s) => s.currentSceneId);

  const schemas = useSchemaStore((state) => state.schemas);

  const selectedComponent = useEngineStore((s) =>
    selectedEntityId && currentSceneId && componentId
      ? s.scenes[currentSceneId]?.entities[selectedEntityId]?.components[
          componentId
        ]
      : null,
  );

  if (!selectedComponent) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        No component selected
      </div>
    );
  }
  const blueprint = schemas[selectedComponent.type];
  if (!blueprint) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        No schema found for component type: {selectedComponent.type}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full text-center bg-secondary font-semibold py-2 border-b border-border flex items-center justify-center gap-2">
        <IconDisplayer type={selectedComponent.type} size={16} />
        <span className="ml-2">{blueprint.label}</span>
      </div>
      <div className="flex-1 p-2 overflow-auto bg-primary/10 flex flex-col gap-2">
        {Object.entries(blueprint.schema).map(([key, propConfig]) => (
          <DisplayProposal
            key={key}
            propConfig={propConfig}
            value={selectedComponent.props[key]}
          />
        ))}
      </div>
    </div>
  );
}
