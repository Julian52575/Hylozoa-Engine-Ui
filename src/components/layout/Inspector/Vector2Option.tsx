import { useState } from "react";
import { FaUnlink,FaLink } from "react-icons/fa";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


export function Vector2Option({ label, x, y, linked }: { label: string, x: number, y: number, linked: boolean }) {
    const [linkedActive, setLinkedActive] = useState(true);

    const toggleLink = () => setLinkedActive(!linkedActive);

    return (
        <div className="flex flex-col gap-2 p-3 bg-zinc-50/50 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-all cursor-default">
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
