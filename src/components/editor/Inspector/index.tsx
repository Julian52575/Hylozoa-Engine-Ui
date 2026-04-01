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

import OptionsManager from "./OptionsManager";
import { useSessionStore } from "@/store/useSessionStore";

const EMPTY_OBJ = {};
function ComponentManager({ component }: { component: any }) {
  const selectedEntityId = useSelectionStore((s) => s.selectedEntityId);
  const currentSceneId = useSelectionStore((s) => s.selectedSceneId);
  
  const setLiveProp = useSessionStore((s) => s.setLiveProp);
  const updateComponentProps = useEngineStore((s) => s.updateComponentProps);
  
  const clearOverrides = useSessionStore((s) => s.clearOverrides);

  const liveProps = useSessionStore((s) => {
    if (!selectedEntityId || !component.id) return EMPTY_OBJ;
    return s.overrides[selectedEntityId]?.[component.id!] || EMPTY_OBJ;
  });

  const schemas = useSchemaStore((s) => s.schemas);
  const schema = schemas[component.type];
  if (!schema) return null;

  const handleLiveChange = (key: string, newValue: any) => {
    if (!selectedEntityId) return;
    const current = liveProps?.[key] ?? component.props[key];
    if (JSON.stringify(current) === JSON.stringify(newValue)) return;
    setLiveProp(selectedEntityId!, component.id!, { [key]: newValue });
  };

  const handleCommit = (key: string, newValue: any) => {
    updateComponentProps(currentSceneId!, selectedEntityId!, component.id!, {
      [key]: newValue,
    });
    clearOverrides();
    console.log("Committed change for", key, "with value", newValue);
  };

  return (
    <AccordionItem
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
          Object.entries(schema.schema).map(([key, propConfig]) => {
            const displayValue =
              liveProps[key] !== undefined
                ? liveProps[key]
                : component.props[key];
            return (
              <OptionsManager
                key={key}
                propConfig={propConfig}
                value={displayValue}
                allValues={{ ...component.props, ...(liveProps || EMPTY_OBJ) }}
                onValueChange={(newValue) => handleLiveChange(key, newValue)}
                onCommit={(newValue) => handleCommit(key, newValue)}
              />
            );
          })}
      </AccordionContent>
    </AccordionItem>
  );
}

export function Inspector() {
  const selectedEntityId = useSelectionStore((state) => state.selectedEntityId);
  const currentSceneId = useSelectionStore((state) => state.selectedSceneId);
  const openComponents = useSelectionStore((s) => s.openComponentIds);
  const setOpenComponents = useSelectionStore((s) => s.setOpenComponents);

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
          {Object.entries(entity.components).map(([componentId, component]) => (
            <ComponentManager key={componentId} component={component} />
          ))}
        </Accordion>
      </div>
    </div>
  );
}
