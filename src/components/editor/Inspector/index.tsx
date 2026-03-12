
import { Vector2Option } from "./Vector2Option";
import { EnumOption } from "./EnumOption";
import { BooleanOption } from "./BooleanOption";
import { TextOption } from "./TextOption";
import { NumberOption } from "./NumberOption";

import { useSelectionStore } from "@/store/useSelectionStore";
import { useEngineStore } from "@/store/engineStore";
import IconDisplayer from "../IconDisplayer";

function DisplayProposal({ propConfig }: { propConfig: any }) {
    const { type, label, default: defaultValue, options } = propConfig;

    switch(type) {
        case "vector2":
            return <Vector2Option label={label} x={defaultValue.x} y={defaultValue.y} linked={true} />;
        case "enum":
            return <EnumOption label={label} options={options || []} defaultValue={defaultValue}  />;
        case "boolean":
            return <BooleanOption label={label} checked={defaultValue} />;
        case "text":
            return <TextOption label={label} value={defaultValue} />;
        case "number":
            return <NumberOption label={label} value={defaultValue} />;
        default:
            return null;
    }
}

export function Inspector() {
    const selectedEntityId = useSelectionStore((state) => state.selectedEntityId);
    const componentId = useSelectionStore((state) => state.selectedComponentId);
    const currentSceneId = useEngineStore((s) => s.currentSceneId);

    const selectedComponent = useEngineStore((s) => 
        selectedEntityId && currentSceneId && componentId ? s.scenes[currentSceneId]?.entities[selectedEntityId]?.components[componentId] : null
    );

    if (!selectedComponent) {
        return (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
                No component selected
            </div>
        );
    }

    console.log("Selected Component:", selectedComponent.props);


    return (
        <div className="w-full h-full flex flex-col">
            <div className="w-full text-center bg-secondary font-semibold py-2 border-b border-border flex items-center justify-center gap-2">
                <IconDisplayer type={selectedComponent.type} size={16} /> 
                <span className="ml-2">
                    {selectedComponent.type.charAt(0).toUpperCase() + selectedComponent.type.slice(1)}
                </span>
            </div>
            <div className="flex-1 p-2 overflow-auto bg-primary/10 flex flex-col gap-2">
                {Object.entries(selectedComponent.props).map(([key, propConfig]) => (
                    <DisplayProposal 
                        key={key}
                        propConfig={propConfig}
                    />
                ))}
                {/* <Vector2Option label="Offset" x={0} y={0} linked={false} />
                <EnumOption label="AnchorMode" options={["Layer 1", "Layer 2", "Layer 3", "Layer 4"]} />
                <BooleanOption label="Ignore Rotation" checked={false} />
                <BooleanOption label="Enabled" checked={true} />
                <Vector2Option label="Zoom" x={0} y={0} linked={true} />
                <TextOption label="Text" value={"Text here"} />
                <NumberOption label="Priority" value={0} /> */}
            </div>
        </div>
    );
}