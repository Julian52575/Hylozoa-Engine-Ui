import { Tree,NodeRendererProps } from 'react-arborist';
import { FaFile } from "react-icons/fa";
import { FaChevronDown,FaChevronRight } from "react-icons/fa";
import { Input } from "@/components/ui/input"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useState } from 'react';

type FileData = {
  id: string;
  name: string;
  children?: FileData[]; // Optionnel pour les fichiers (leafs)
};

function Node({ node, style, dragHandle } : NodeRendererProps<FileData>) {
  return (
    <div style={style} ref={dragHandle} onClick={() => node.toggle()} className='flex items-center gap-1 hover:bg-primary/10 px-2 w-max rounded cursor-pointer select-none'>
      {node.isLeaf ? <FaFile /> : 
        (node.isOpen ? <FaChevronDown /> : <FaChevronRight />)}
      {node.data.name}
    </div>
  );
}

export function FolderDisplayer() {
    const data: FileData[] = [
        {id:"0", name:"Root", children: [
            { id: "1", name: "Unread.txt" },
            { id: "2", name: "Threads.txt" },
            {
                id: "3",
                name: "Chat Rooms",
                children: [
                { id: "c1", name: "General", children: [] },
                { id: "c2", name: "Random.tsx" },
                { id: "c3", name: "Open Source Projects.img" },
                ],
            },
            {
                id: "4",
                name: "Direct Messages",
                children: [
                { id: "d1", name: "Alice.txt" },
                { id: "d2", name: "Bob.txt" },
                { id: "d3", name: "Charlie.txt" },
                ],
            },
        ]},
    ];

    const [searchTerm, setSearchTerm] = useState("");
    return (
        <div className="h-full flex flex-col bg-secondary items-start">
            <div className='w-full bg-primary/10 px-4 py-2'>
                Files System
            </div>
            <div className='p-2 w-max'>
                <Input 
                    placeholder="Search files..." 
                    className="bg-primary/5 border-0 focus:ring-0 focus:ring-offset-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <ContextMenu>
                <ContextMenuTrigger className='flex h-full px-2 py-1 overflow-auto'>
                    <Tree 
                        indent={10}
                        searchTerm={searchTerm}
                        searchMatch={
                            (node, term) => node.data.name.toLowerCase().includes(term.toLowerCase())
                        }
                        data={data} 
                    >
                        {Node}
                    </Tree>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48">
                    <div>
                        hello
                    </div>
                </ContextMenuContent>
            </ContextMenu>
        </div>
    )
}