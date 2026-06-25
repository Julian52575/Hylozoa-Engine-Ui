import { Tree, NodeRendererProps } from "react-arborist";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import {
  AutoSizer,
  type AutoSizerChildProps,
} from "react-virtualized-auto-sizer";

import { FileIcon } from "@react-symbols/icons/utils";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useEffect, useState } from "react";

import { useProjectStore } from "@/store/projectStore";
import { useSessionStore } from "@/store/useSessionStore";

import { invoke } from "@tauri-apps/api/core";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { openPath } from "@tauri-apps/plugin-opener";
import { watch } from "@tauri-apps/plugin-fs";

type FileData = {
  id: string;
  name: string;
  isDir?: boolean;
  children?: FileData[];
};

type FileEntry = {
  name: string;
  path: string;
  is_dir: boolean;
  children?: FileEntry[];
};

const HlzIcon = ({ width = 24, height = 24 }: { width?: number; height?: number }) => (
  <svg width={width} height={height} viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="38" fill="#0d0d1a"/>
    <circle cx="40" cy="40" r="36" fill="none" stroke="#3a2a6e" strokeWidth="2"/>
    <circle cx="40" cy="14" rx="12" fill="#2a1060" opacity="0.4"/>
    {/* tige */}
    <path d="M40,55 Q40,40 40,26" fill="none" stroke="#6c3fc5" strokeWidth="2" strokeLinecap="round"/>
    {/* branches */}
    <path d="M40,38 Q31,33 26,36" fill="none" stroke="#7b4fd4" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M40,38 Q49,33 54,36" fill="none" stroke="#7b4fd4" strokeWidth="1.5" strokeLinecap="round"/>
    {/* feuilles */}
    <ellipse cx="25" cy="35" rx="7" ry="3.5" transform="rotate(-20,25,35)" fill="#5e2db8"/>
    <ellipse cx="55" cy="35" rx="7" ry="3.5" transform="rotate(20,55,35)" fill="#5e2db8"/>
    <ellipse cx="40" cy="24" rx="5" ry="3" fill="#7a3de0"/>
    {/* racines */}
    <path d="M40,55 Q30,62 24,68" fill="none" stroke="#8b1a3a" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M40,55 Q50,62 56,68" fill="none" stroke="#8b1a3a" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

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
          {!node.data.isDir ? (
            <FileIcon 
              fileName={node.data.name} 
              className="w-4 h-4"
              editFileExtensionData={{
                hlz: () => <HlzIcon width={16} height={16} />,
              }}
            />
          ) : node.isOpen ? (
            <Icon icon="lucide:chevron-down" className="w-4 h-4" />
          ) : (
            <Icon icon="lucide:chevron-right" className="w-4 h-4" />
          )}
          <div className="font-normal text-sm">{node.data.name}</div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ExplorerContextMenu path={node.data.id} isDir={node.data.isDir || false} />
      </ContextMenuContent>
    </ContextMenu>
  );
}

function entryToData(entry: FileEntry): FileData {
  return {
    id: entry.path,
    name: entry.name,
    isDir: entry.is_dir,
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
    function: async (path: string) => {
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
    icon: "lucide:code",
    label: "Editer",
    action: "edit",
    targets: ["code"],
    function: async (path: string) => {
      const sessionStore = useSessionStore.getState();
      sessionStore.setCurrentCodeFilePath(path);
      sessionStore.setCurrentOnglet("console");
    },
  },
  {
    icon: "lucide:edit-3",
    label: "Renommer",
    action: "rename",
    targets: ["file", "dir", "code"],
  },
  {
    icon: "lucide:trash-2",
    label: "Supprimer",
    action: "delete",
    targets: ["file", "dir", "code"],
  },
  {
    icon: "lucide:files",
    label: "Dupliquer",
    action: "duplicate",
    targets: ["file", "dir", "code"],
  },
  {
    icon: "lucide:link",
    label: "Copier le chemin relatif",
    action: "copy-relative-path",
    targets: ["file", "dir", "code"],
    function: async (path: string) => {
      const projectRoot = useProjectStore.getState().currentProjectPath;
      let relativePath = path.replace(projectRoot, "");
      if (relativePath.startsWith("/") || relativePath.startsWith("\\")) {
        relativePath = relativePath.substring(1);
      }
      await writeText(relativePath || ".");
    },
  },
  {
    icon: "lucide:folder-root",
    label: "Copier le chemin absolu",
    action: "copy-absolute-path",
    targets: ["file", "dir", "code"],
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
  const handleAction = async (item: (typeof items)[0]) => {
    if (item && item.function) {
      await item.function(path);
    }
  };

  let target = isDir ? "dir" : "file";
  if (path.endsWith(".lua")) {
    target = "code";
  }

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
    let cancelled = false;
    let unwatch: (() => void) | undefined;

    const ReadDir = async () => {
      const result: FileEntry = await invoke("read_dir_recursively", {
        path: path,
      });
      if (cancelled) return;
      setData([entryToData(result)]);
    };

    const cleanup = () => {
      cancelled = true;
      if (unwatch) {
        try {
          unwatch();
        } catch (error) {
          console.error("Error occurred while unwatching directory:", error);
        }
        unwatch = undefined;
      }
    };

    ReadDir();

    (async () => {
      const stop = await watch(
        path,
        (_event) => {
          ReadDir();
        },
        { recursive: true, delayMs: 300 },
      );
      if (cancelled) {
        stop();
      } else {
        unwatch = stop;
      }
    })();

    window.addEventListener("beforeunload", cleanup);
    return () => {
      cleanup();
      window.removeEventListener("beforeunload", cleanup);
    };
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
