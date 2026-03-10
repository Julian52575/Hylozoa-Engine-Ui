import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Label } from "../ui/label";
import { Button } from "../ui/button";

import { FaPlay } from "react-icons/fa";
import { FaStop } from "react-icons/fa";
import { FaPause } from "react-icons/fa";

export function Toolbar() {
    const scenes = ["SampleScene", "AnotherScene"];
    return (
        <div className="w-full h-full flex flex-row items-center justify-between bg-primary/10">
            <div className="flex flex-row px-2 py-1 my-1 bg-primary/10 items-center gap-2 ml-4 rounded-md">
                <Label className="font-semibold bg-">
                    Actual Scene:
                </Label>
                <Select defaultValue="SampleScene">
                    <SelectTrigger className="w-[150px] border-none bg-secondary/50 focus:ring-0 focus:ring-offset-0">
                        <SelectValue placeholder="Select Scene" />
                    </SelectTrigger>
                    <SelectContent 
                        side="bottom"
                        align="start"
                        position="popper"
                        sideOffset={-10}
                    >
                        {scenes.map((scene) => (
                            <SelectItem key={scene} value={scene}>
                                {scene}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="mr-2 flex flex-row items-center">
                <Button variant="ghost" className="cursor-pointer" size={"icon-sm"}>
                    <FaPlay className="ml-0.5" />
                </Button>
                <Button variant="ghost" className="cursor-pointer" size={"icon-sm"}>
                    <FaPause />
                </Button>
                <Button variant="ghost" className="cursor-pointer" size={"icon-sm"}>
                    <FaStop  />
                </Button>
            </div>
        </div>
    );
}