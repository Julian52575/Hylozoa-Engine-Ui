import { Vector2Option } from "./Vector2Option";
import { EnumOption } from "./EnumOption";
import { BooleanOption } from "./BooleanOption";
import { TextOption } from "./TextOption";
import { NumberOption } from "./NumberOption";
import { FileOption } from "./FileOption";
import { ColorOption } from "./ColorOption";

import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { useSelectionStore } from "@/store/useSelectionStore";
import { useEngineStore } from "@/store/engineStore";
import { useSchemaStore } from "@/store/useSchemaStore";
import { Icon } from "@iconify/react";

function DisplayProposal({
  propConfig,
  value,
  allValues,
  onChange,
}: {
  propConfig: any;
  value: any;
  allValues?: Record<string, any>;
  onChange?: (newValue: any) => void;
}) {
  const { type, label, options, dependency, min, max, step, accept } = propConfig;

  if (dependency && allValues) {
    const [depKey, depValue] = dependency.split("-");
    if (allValues[depKey] !== depValue) {
      return null;
    }
  }

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
          value={value}
          onChange={onChange}
        />
      );
    case "boolean":
      return <BooleanOption label={label} checked={value} />;
    case "text":
      return <TextOption label={label} value={value} />;
    case "number":
      return (
        <NumberOption
          label={label}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
        />
      );
    case "file":
      return <FileOption label={label} value={value} accept={accept} />;
    case "color":
      return <ColorOption label={label} value={value} />;
    default:
      return <div className="font-semibold">Unsupported type: {type}</div>;
  }
}

export function Inspector() {
  const selectedEntityId = useSelectionStore((state) => state.selectedEntityId);
  const currentSceneId = useSelectionStore((state) => state.selectedSceneId);
  const schemas = useSchemaStore((state) => state.schemas);
  const openComponents = useSelectionStore((s) => s.openComponentIds);
  const setOpenComponents = useSelectionStore((s) => s.setOpenComponents);

  const updateComponentProps = useEngineStore((s) => s.updateComponentProps);

  const entity = useEngineStore((s) =>
    selectedEntityId && currentSceneId
      ? s.scenes[currentSceneId]?.entities[selectedEntityId]
      : null,
  );

  if (!entity) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        No entity selected
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-3 border-b bg-secondary/50 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-blue-500" />
        <h2 className="font-bold text-sm uppercase tracking-wider">
          {entity.name}
        </h2>
      </div>
      <div className="flex-1 overflow-auto p-2">
        <Accordion
          type="multiple"
          className="flex flex-col gap-1 border-none"
          value={openComponents}
          onValueChange={(ids) => setOpenComponents(ids)}
        >
          {Object.values(entity.components).map((component) => {
            const schema = schemas[component.type];
            if (!schema) return null;
            return (
              <AccordionItem
                key={component.id}
                value={component.id || ""}
                className="border rounded-md bg-card overflow-hidden !border-b"
              >
                <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-accent/50 hover:cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <Icon icon={schema.icon} className="w-4 h-4" />
                    <span>{component.name}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-3 border-t bg-primary/5 flex flex-col gap-3 ">
                  {schema.schema &&
                    Object.entries(schema.schema).map(([key, propConfig]) => (
                      <DisplayProposal
                        key={key}
                        propConfig={propConfig}
                        value={component.props[key]}
                        allValues={component.props}
                        onChange={(newValue: any) => {
                          updateComponentProps(
                            currentSceneId!,
                            selectedEntityId!,
                            component.id!,
                            { [key]: newValue },
                          );
                        }}
                      />
                    ))}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}
