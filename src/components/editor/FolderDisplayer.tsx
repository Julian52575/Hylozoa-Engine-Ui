import { Tree, NodeRendererProps } from "react-arborist";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import {
  AutoSizer,
  type AutoSizerChildProps,
} from "react-virtualized-auto-sizer";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useEffect, useState } from "react";

import { useProjectStore } from "@/store/projectStore";

import { invoke } from "@tauri-apps/api/core";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { openPath } from "@tauri-apps/plugin-opener";


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
            <Icon icon="lucide:file" className="w-4 h-4" />
          ) : node.isOpen ? (
            <Icon icon="lucide:chevron-down" className="w-4 h-4" />
          ) : (
            <Icon icon="lucide:chevron-right" className="w-4 h-4" />
          )}
          <div className="font-normal text-sm">{node.data.name}</div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ExplorerContextMenu path={node.data.id} isDir={!node.isLeaf} />
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

const items = [
  {
    icon: "lucide:folder-open",
    label: "Ouvrir dans l'explorateur",
    action: "open",
    targets: ["file", "dir"],
    function: async (path : string) => {
      await openPath(path);
    },
  },
  {
    icon: "lucide:folder-plus",
    label: "Créer un sous-dossier",
    action: "create-folder",
    targets: ["dir"],
  },
  {
    icon: "lucide:file-plus",
    label: "Importer un fichier",
    action: "import-file",
    targets: ["dir"],
  },
  {
    icon: "lucide:edit-3",
    label: "Renommer",
    action: "rename",
    targets: ["file", "dir"],
  },
  {
    icon: "lucide:trash-2",
    label: "Supprimer",
    action: "delete",
    targets: ["file", "dir"],
  },
  {
    icon: "lucide:files",
    label: "Dupliquer",
    action: "duplicate",
    targets: ["file", "dir"],
  },
  {
    icon: "lucide:link",
    label: "Copier le chemin relatif",
    action: "copy-relative-path",
    targets: ["file", "dir"],
    function: async (path: string) => {
      const projectRoot = useProjectStore.getState().currentProjectPath;
      let relativePath = path.replace(projectRoot, "");
      if (relativePath.startsWith("/") || relativePath.startsWith ("\\")) {
        relativePath = relativePath.substring(1);
      }
      await writeText(relativePath || ".");
    },
  },
  {
    icon: "lucide:folder-root",
    label: "Copier le chemin absolu",
    action: "copy-absolute-path",
    targets: ["file", "dir"],
    function: async (path: string) => {
      await writeText(path);
    },
  },
];

export function ExplorerContextMenu({
  path,
  isDir,
}: {
  path: string;
  isDir: boolean;
}) {
  const handleAction = async (item: typeof items[0]) => {
    // console.log(item, path, isDir);
    if (item && item.function) {
      await item.function(path);
    }
  };

  const target = isDir ? "dir" : "file";

  return (
    <div
      role="menu"
      className="flex w-max select-none flex-col gap-1 rounded-md p-1 text-sm"
    >
      {items
        .filter((item) => item.targets.includes(target))
        .map((item) => (
          <ContextMenuItem
            key={item.action}
            role="menuitem"
            onClick={async () => await handleAction(item)}
            className="
            flex w-full items-center gap-2 rounded px-2 py-1
            text-left transition-colors
            hover:bg-primary/10
            hover:cursor-pointer
          "
          >
            <Icon icon={item.icon} className="h-4 w-4 shrink-0" />

            <span>{item.label}</span>
          </ContextMenuItem>
        ))}
    </div>
  );
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
    <div className="h-full flex flex-col bg-secondary overflow-hiddenitems-start">
      <div className="w-full bg-primary/10 px-4 py-2">Files System</div>
      <div className="p-2 w-full">
        <Input
          placeholder="Search files..."
          className="bg-primary/5 border-0 focus:ring-0 focus:ring-offset-0 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ContextMenu>
        <ContextMenuTrigger asChild onContextMenu={(e) => e.stopPropagation()}>
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
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ExplorerContextMenu path={path} isDir={true} />
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
