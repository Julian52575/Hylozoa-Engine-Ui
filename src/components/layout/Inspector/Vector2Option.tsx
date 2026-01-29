import { useState } from "react";
import { FaUnlink,FaLink } from "react-icons/fa";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


function LinkedButton(){
    const [linkedActive, setLinkedActive] = useState(true);
    const toggleLink = () => setLinkedActive(!linkedActive);

    return (
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
    );
}

function AxisInput({ axisLabel, value, colorClass }: { axisLabel: string, value: number, colorClass: string }) {
    return (
        <div className="relative flex items-center group ">
            <Label className={`absolute left-2 inset-y-0 flex items-center text-sm font-semibold ${colorClass} select-none group-focus-within:${`${colorClass}/70`} mb-0.5`}>
                {axisLabel}
            </Label>
            <Input
                type="number" 
                defaultValue={value} 
                className={`pl-6 h-8 text-sm font-mono border-zinc-200 focus-visible:border-${colorClass.split('-')[1]}-400 focus-visible:ring-${colorClass.split('-')[1]}-400/30 transition-all bg-white`}
            />
        </div>
    );
}

export function Vector2Option({ label, x, y, linked }: { label: string, x: number, y: number, linked: boolean }) {
    return (
        <div className="flex flex-col gap-2 p-3 bg-zinc-50/50 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-all cursor-default">
            <div className="flex items-center justify-between px-1">
                <span className="text-sm font-semibold text-zinc-500">
                    {label}
                </span>
                {linked && <LinkedButton />}
            </div>

            <div className="grid grid-cols-2 gap-2">
                <AxisInput axisLabel="X" value={x} colorClass="text-red-500" />
                <AxisInput axisLabel="Y" value={y} colorClass="text-green-500" />                
            </div>
        </div>
    );
}
