import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
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

function Vector2({ label, x, y, linked }: { label: string, x: number, y: number, linked: boolean }) {
    const [linkedActive, setLinkedActive] = useState(true);

    const toggleLink = () => setLinkedActive(!linkedActive);

    return (
        <div className="flex flex-col gap-2 p-3 bg-zinc-50/50 rounded-lg border border-zinc-200">
            <div className="flex items-center justify-between px-1">
                <span className="text-sm font-semibold text-zinc-500">
                    {label}
                </span>
                {linked && (
                    <Button 
                        onClick={toggleLink}
                        size={"icon-xs"}
                        variant={"ghost"}
                        className="p-1 hover:bg-zinc-200 rounded-md transition-colors cursor-pointer"
                        title={linkedActive ? "Unlink axes" : "Link axes"}
                    >
                        {linkedActive ? (
                            <FaLink className="text-zinc-500" size={12} />
                        ) : (
                            <FaUnlink className="text-zinc-400" size={12} />
                        )}
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="relative flex items-center group ">
                    <Label className="absolute left-2 inset-y-0 flex items-center text-sm font-semibold text-red-500/70 select-none group-focus-within:text-red-500 mb-0.5">
                        X
                    </Label>
                    <Input
                        type="number" 
                        defaultValue={x} 
                        className="pl-6 h-8 text-sm font-mono border-zinc-200 focus-visible:border-red-400 focus-visible:ring-red-400/30 transition-all bg-white"
                    />
                </div>

                {/* Axis Y */}
                <div className="relative flex items-center group">
                    <Label className="absolute left-2 inset-y-0 flex items-center text-sm font-semibold text-green-600/70 select-none group-focus-within:text-green-600 mb-0.5">
                        Y
                    </Label>
                    <Input 
                        type="number" 
                        defaultValue={y} 
                        className="pl-6 h-8 text-sm font-mono border-zinc-200 focus-visible:border-green-400 focus-visible:ring-green-400/30 transition-all bg-white"
                    />
                </div>
            </div>
        </div>
    );
}

function MultiSelectOption({ label, options }: { label: string, options: string[] }) {
    return (
        <div className="flex flex-col gap-2 p-3 bg-zinc-50/50 rounded-lg border border-zinc-200 transition-all hover:border-zinc-300">
            <Label 
                htmlFor={label} 
                className="text-sm font-semibold text-zinc-500 cursor-pointer px-1"
            >
                {label}
            </Label>
            <Select defaultValue={options[0]}>
                <SelectTrigger 
                    id={label} 
                    className="w-full h-8 text-sm bg-white border-zinc-200 focus:ring-1 focus:ring-zinc-400 focus:ring-offset-0 transition-all font-medium"
                >
                    <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                
                <SelectContent 
                    side="bottom"
                    align="start"
                    position="popper" 
                    sideOffset={-5}
                    className="border-zinc-200 shadow-lg"
                >
                    {options.map((option) => (
                        <SelectItem 
                            key={option} 
                            value={option}
                            className="text-sm focus:bg-zinc-100 focus:text-zinc-900 cursor-pointer"
                        >
                            {option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

function CheckboxOption({ label, checked }: { label: string, checked: boolean }) {
    return (
        <div className="flex items-center justify-between p-3 bg-zinc-50/50 rounded-lg border border-zinc-200 transition-all hover:border-zinc-300">
            <Label 
                htmlFor={label} 
                className="text-sm font-semibold text-zinc-500 cursor-pointer select-none"
            >
                {label}
            </Label>

            <Switch 
                defaultChecked={checked} 
                id={label} 
                className="data-[state=unchecked]:bg-zinc-300 scale-90 cursor-pointer transition-all"
            />
        </div>
    );
}

function TextareaOption({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col gap-2 p-3 bg-zinc-50/50 rounded-lg border border-zinc-200 transition-all hover:border-zinc-300">
            <div className="px-1">
                <Label 
                    htmlFor={label} 
                    className="text-sm font-semibold text-zinc-500 cursor-pointer"
                >
                    {label}
                </Label>
            </div>

            <Textarea 
                defaultValue={value} 
                id={label} 
                className="bg-white border-zinc-200 focus-visible:ring-zinc-400/30 text-sm min-h-[110px] resize-none leading-relaxed placeholder:text-zinc-400"
                placeholder={`Enter ${label.toLowerCase()}...`}
            />
        </div>
    );
}

function NumberOPtion({ label, value }: { label: string, value: number }) {
    return (
        <div className="flex flex-col gap-2 p-3 bg-zinc-50/50 rounded-lg border border-zinc-200 transition-all hover:border-zinc-300">
            <Label 
                htmlFor={label}
                className="text-sm font-semibold text-zinc-500 cursor-pointer px-1"
            >
                {label}
            </Label>
            <Input 
                type="number" 
                defaultValue={value} 
                id={label} 
                className="h-8 text-sm font-mono border-zinc-200 focus-visible:border-zinc-400 focus-visible:ring-zinc-400/30 transition-all bg-white"
            />
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
                <NumberOPtion label="Priority" value={0} />
            </div>
        </div>
    );
}