import { HeaderWindow } from "@/components/HeaderWindow";

import { Hierarchie } from "@/components/editor/Hierarchie";
import { FolderDisplayer } from "@/components/editor/FolderDisplayer";
import { BottomPanel } from "@/components/editor/BottomPanel";
import { MainScene } from "@/components/editor/MainScene";
import { Inspector } from "@/components/editor/Inspector";
import { SceneList } from "@/components/editor/SceneList";
import { ViewportButtons } from "@/components/editor/Viewport";
import { SceneManager } from "@/components/editor/SceneManager";
import { Toolbar } from "@/components/editor/Toolbar";
import { useSchemaStore } from "@/store/useSchemaStore";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { serializeEngineState, useEngineStore } from "@/store/engineStore";
import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function EditorPage() {
  useEffect(() => {
    const temporal = (useEngineStore as any).temporal;
    if (!temporal) {
      return;
    }

    const handleKeyDown = async (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;

      if (isMod && e.key === "z") {
        e.preventDefault();
        e.stopPropagation();
        if (e.shiftKey) {
          temporal.getState().redo();
        } else {
          temporal.getState().undo();
        }
      } else if (isMod && e.key === "y") {
        e.preventDefault();
        e.stopPropagation();
        temporal.getState().redo();
      }

      if (isMod && e.key === "s") {
        e.preventDefault();
        e.stopPropagation();
        const currentStoreState = useEngineStore.getState();
        const serialized = JSON.stringify(
          serializeEngineState(currentStoreState),
        );
        try {
          await invoke("save_compressed_project", {
            path: "project.hlz",
            data: serialized,
          });
          alert(`Project saved successfully`);
        } catch (error) {
          alert(`Failed to save project: ${error}`);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  const loadSchemas = useSchemaStore((s) => s.loadSchemas);

  useEffect(() => {
    loadSchemas();
  }, [loadSchemas]);


  return (
    <div className="h-svh w-svw flex flex-col">
      <HeaderWindow isHome={false} />
      <Toolbar />
      <ResizablePanelGroup className="h-full flex">
        <ResizablePanel
          minSize={150}
          defaultSize={300}
          className="flex flex-col"
        >
          <ResizablePanelGroup
            className="h-full flex flex-col"
            orientation="vertical"
          >
            <ResizablePanel minSize={40} defaultSize={300}>
              <SceneManager />
            </ResizablePanel>
            <ResizableHandle className="h-0.5 w-full bg-primary/20 cursor-row-resize" />
            <ResizablePanel minSize={40} defaultSize={300}>
              <Hierarchie />
            </ResizablePanel>
            <ResizableHandle className="h-0.5 w-full bg-primary/20 cursor-row-resize" />
            <ResizablePanel minSize={40} defaultSize={300}>
              <FolderDisplayer path=".." />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle className="h-full w-0.5 bg-primary/20 cursor-col-resize" />
        <ResizablePanel>
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel minSize={30} defaultSize={80}>
              <div className="w-full h-full flex flex-col">
                <div className="border-b border-zinc-300">
                  <SceneList />
                </div>
                <div className="flex-1">
                  <ViewportButtons />
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle className="h-0.5 w-full bg-primary/20 cursor-row-resize" />
            <ResizablePanel minSize={200}>
              <MainScene />
            </ResizablePanel>
            <ResizableHandle className="h-0.5 w-full bg-primary/20 cursor-row-resize" />
            {/* <ResizablePanel minSize={70} defaultSize={70}> */}
              <BottomPanel />
            {/* </ResizablePanel> */}
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle className="h-full w-0.5 bg-primary/20 cursor-col-resize" />
        <ResizablePanel minSize={150} defaultSize={350}>
          <Inspector />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
