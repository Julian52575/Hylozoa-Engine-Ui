import { BsCameraVideoFill } from "react-icons/bs";

import { Vector2Option } from "./Vector2Option";
import { EnumOption } from "./EnumOption";
import { BooleanOption } from "./BooleanOption";
import { TextOption } from "./TextOption";
import { NumberOption } from "./NumberOption";


export function Inspector() {
    return (
        <div className="w-full h-full flex flex-col">
            <div className="w-full text-center bg-secondary font-semibold py-2 border-b border-border">
                <BsCameraVideoFill className="inline-block mr-2" />
                Camera
            </div>
            <div className="flex-1 p-2 overflow-auto bg-primary/10 flex flex-col gap-2">
                <Vector2Option label="Offset" x={0} y={0} linked={false} />
                <EnumOption label="AnchorMode" options={["Layer 1", "Layer 2", "Layer 3", "Layer 4"]} />
                <BooleanOption label="Ignore Rotation" checked={false} />
                <BooleanOption label="Enabled" checked={true} />
                <Vector2Option label="Zoom" x={0} y={0} linked={true} />
                <TextOption label="Text" value={"Text here"} />
                <NumberOption label="Priority" value={0} />
            </div>
        </div>
    );
}