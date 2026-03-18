import { Button } from "../ui/button";
import { IoClose } from "react-icons/io5";
import { FaPlus } from "react-icons/fa";
import { FaPlay } from "react-icons/fa";
import { FaStop } from "react-icons/fa";
import { FaPause } from "react-icons/fa";
import { useEngineStore } from "@/store/engineStore";

function ScenesDisplayer() {

  const scenes = useEngineStore().scenes;

  return (
    <div className="w-full flex items-end justify-start h-8">
      {Object.values(scenes).map((scene) => (
        <div
          key={scene.id}
          className="bg-primary/5 px-2 py-1 border-r border-primary/10 flex items-center gap-1 h-full"
        >
          <span>{scene.name}</span>
          <IoClose className="cursor-pointer" size={20} color="red" />
        </div>
      ))}
      <div className="bg-primary/5 px-2 py-1 border-r border-primary/10 flex items-center gap-1 h-full">
        <FaPlus className="cursor-pointer" size={16} />
      </div>
    </div>
  );
}

export function Toolbar() {
  return (
    <div className="w-full h-full flex flex-row justify-between bg-primary/10 items-end">
      <ScenesDisplayer />
      <div className="flex flex-row items-center bg-primary/10 gap-1 h-10 m-1 rounded-md px-2">
        <Button variant="ghost" className="cursor-pointer" size={"icon-sm"}>
          <FaPlay className="ml-0.5" />
        </Button>
        <Button variant="ghost" className="cursor-pointer" size={"icon-sm"}>
          <FaPause />
        </Button>
        <Button variant="ghost" className="cursor-pointer" size={"icon-sm"}>
          <FaStop />
        </Button>
      </div>
    </div>
  );
}
