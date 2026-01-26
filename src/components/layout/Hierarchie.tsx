import { Tree,NodeRendererProps } from "react-arborist";
import { FaChevronDown,FaChevronRight } from "react-icons/fa";
import { BsCameraVideoFill } from "react-icons/bs";
import { MdLightMode } from "react-icons/md";
import { MdOutlineRectangle } from "react-icons/md";
import { FaRegCircle } from "react-icons/fa";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";


type NodeData = {
  id: string;
  name: string;
  type : "node" | "Rectangle" | "Circle" | "light" | "camera";
  children?: NodeData[]; // Optional for leaf nodes
};

function Node({ node, style, dragHandle } : NodeRendererProps<NodeData>) {
    const displayIcon = () => {
        switch(node.data.type) {
            case "camera":
                return <BsCameraVideoFill size={12}/>;
            case "light":
                return <MdLightMode size={12}/>;
            case "Rectangle":
                return <MdOutlineRectangle size={14}/>;
            case "Circle":
                return <FaRegCircle size={12}/>;
            case "node":
                return <FaRegCircle size={12} color="blue" className="font-bold"/>;
            default:
                return null;
        }
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger
                asChild
                onContextMenu={(e) => e.stopPropagation()}
            >
                <div 
                    style={style} 
                    ref={dragHandle} 
                    className='flex items-center gap-1 cursor-default select-none'
                >
                    {!node.isLeaf && node.isOpen && <FaChevronDown size={10} onClick={() => node.toggle()} className="cursor-pointer"/>}
                    {!node.isLeaf && !node.isOpen && <FaChevronRight size={10} onClick={() => node.toggle()} className="cursor-pointer"/>}
                    {displayIcon()}  
                    <div className="font-normal text-sm">
                        {node.data.name}
                    </div>
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
                <div>
                    {node.data.type} Options
                </div>
            </ContextMenuContent>
        </ContextMenu>
  );
}

export function Hierarchie() {
    const data : NodeData[] = [
        { id: "1", name: "Scene", type: "node", children: [
            { id: "1-1", name: "Camera", type: "camera" },
            { id: "1-2", name: "Lights", type: "node", children: [
                { id: "1-2-1", name: "Directional Light", type: "light" },
                { id: "1-2-2", name: "Ambient Light", type: "light" },
            ]},
            { id: "1-3", name: "Meshes", type: "node", children: [
                { id: "1-3-1", name: "Rectangle", type: "Rectangle" },
                { id: "1-3-2", name: "Circle", type: "Circle" },
            ]},
        ]},
    ];

    return (
        <div className="bg-secondary h-full">
           <div className="p-2 bg-primary/10">
               Scene
           </div>
            <div className='flex h-full px-2 py-1 overflow-auto'>
                <Tree
                    // indent={10}
                    initialData={data}
                >
                    {Node}
                </Tree>
            </div>
        </div>
    )
}