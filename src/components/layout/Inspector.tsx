import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";

import { BsCameraVideoFill } from "react-icons/bs";
import { FaUnlink,FaLink } from "react-icons/fa";

import { useState } from "react";


function Vector2({label,x,y,linked}: {label: string, x: number, y: number, linked: boolean}) {
    const [linkedActive, setLinkedActive] = useState(true);
    const displayLink = () => {
        if (!linked) return null;
        return linkedActive ? (
            <FaLink className="text-zinc-500 inline cursor-pointer" size={13} onClick={() => setLinkedActive(false)} /> 
            ) : ( <FaUnlink className="text-zinc-400 inline cursor-pointer" size={13} onClick={() => setLinkedActive(true)} />)
            ;
    };

    return (
        <div className="flex flex-col gap-1 border-b border-zinc-400 pb-2">
            <div className="flex flex-row items-center gap-2">
                <Label className="font-semibold">
                    {label}
                </Label>
                {displayLink()}
            </div>
            <div className="flex flex-row gap-2">
                <div className="flex flex-row flex-1 items-center gap-1">
                    <Label className="text-red-500 bg-primary/10 p-1">
                        X
                    </Label>
                    <Input type="number" defaultValue={x} className="flex-1 bg-white h-[80%]" />
                </div>
                <div className="flex flex-row flex-1 items-center gap-1">
                    <Label className="text-green-500 bg-primary/10 p-1">
                        Y
                    </Label>
                    <Input type="number" defaultValue={y} className="flex-1 bg-white h-[80%]" />
                </div>
            </div>
        </div>
    );
}

function MultiSelectOption({label, options}: {label: string, options: string[]}) {
    return (
        <div className="flex flex-col gap-1 border-b border-zinc-400 pb-2">
            <Label className="font-semibold" htmlFor={label}>
                {label}
            </Label>
            <Select defaultValue={options[0]}>
                <SelectTrigger className="w-[180px]" id={label}>
                    <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent 
                    side="bottom"
                    align="start"
                    position="popper"
                >
                    {options.map((option) => (
                        <SelectItem key={option} value={option}>
                            {option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

function CheckboxOption({label, checked}: {label: string, checked: boolean}) {
    return (
        <div className="flex flex-row items-center justify-between gap-2 border-b border-zinc-400 pb-2">
            <Label className="font-semibold" htmlFor={label}>
                {label}
            </Label>
            <Switch defaultChecked={checked} id={label} />
        </div>
    );
}

function TextareaOption({label, value}: {label: string, value: string}) {
    return (
        <div className="flex flex-col gap-1 border-b border-zinc-400 pb-2">
            <Label className="font-semibold" htmlFor={label}>
                {label}
            </Label>
            <Textarea defaultValue={value} id={label} className="bg-white resize-none h-25" />
        </div>
    );
}

export function Inspector() {
    return (
        <div className="w-full h-full flex flex-col">
            <div className="w-full text-center bg-secondary font-semibold py-2 border-b border-border">
                <BsCameraVideoFill className="inline-block mr-2" />
                Camera
            </div>
            <div className="flex-1 p-2 overflow-auto bg-primary/10 flex flex-col gap-2">
                <Vector2 label="Offset" x={0} y={0} linked={false} />
                <MultiSelectOption label="AnchorMode" options={["Layer 1", "Layer 2", "Layer 3", "Layer 4"]} />
                <CheckboxOption label="Ignore Rotation" checked={false} />
                <CheckboxOption label="Enabled" checked={true} />
                <Vector2 label="Zoom" x={0} y={0} linked={true} />
                <TextareaOption label="Text" value={"Text here"} />
            </div>
        </div>
    );
}