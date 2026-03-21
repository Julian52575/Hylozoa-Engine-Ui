import { Tree, NodeRendererProps } from "react-arborist";
import { FaFile } from "react-icons/fa";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { invoke } from "@tauri-apps/api/core";
import {
  AutoSizer,
  type AutoSizerChildProps,
} from "react-virtualized-auto-sizer";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useEffect, useState } from "react";

type FileData = {
  id: string;
  name: string;
  children?: FileData[];
};

type FileEntry = {
  name: string;
  path: string;
  is_dir: boolean;
  children?: FileEntry[];
};

function Node({ node, style, dragHandle }: NodeRendererProps<FileData>) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild onContextMenu={(e) => e.stopPropagation()}>
        <div
          style={style}
          ref={dragHandle}
          onClick={() => node.toggle()}
          className="flex items-center gap-1 hover:bg-primary/10 px-2 w-max rounded cursor-pointer select-none"
        >
          {node.isLeaf ? (
            <FaFile />
          ) : node.isOpen ? (
            <FaChevronDown size={10} />
          ) : (
            <FaChevronRight size={10} />
          )}
          <div className="font-normal text-sm">{node.data.name}</div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <div>{node.data.name} Options</div>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function entryToData(entry: FileEntry): FileData {
  return {
    id: entry.path,
    name: entry.name,
    children:
      entry.children && entry.children.length > 0
        ? entry.children.map(entryToData)
        : undefined,
  };
}

export function FolderDisplayer({ path }: { path: string }) {
  const [searchTerm, setSearchTerm] = useState("");

  const [data, setData] = useState<FileData[]>([]);
  useEffect(() => {
    const ReadDir = async () => {
      const result: FileEntry = await invoke("read_dir_recursively", {
        path: path,
      });
      setData([entryToData(result)]);
    };
    ReadDir();
  }, [path]);

  return (
    <div className="h-full flex flex-col bg-secondary items-start">
      <div className="w-full bg-primary/10 px-4 py-2">Files System</div>
      <div className="p-2 w-max">
        <Input
          placeholder="Search files..."
          className="bg-primary/5 border-0 focus:ring-0 focus:ring-offset-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex h-full px-2 py-1 overflow-auto">
        <AutoSizer
          renderProp={({ height, width }: AutoSizerChildProps) => (
            <Tree
              indent={10}
              height={height}
              width={width}
              searchTerm={searchTerm}
              searchMatch={(node, term) =>
                node.data.name.toLowerCase().includes(term.toLowerCase())
              }
              data={data}
            >
              {Node}
            </Tree>
          )}
        />
      </div>
    </div>
  );
}
