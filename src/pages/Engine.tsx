import { HeaderWindow } from "@/components/HeaderWindow";

import { Hierarchie } from "@/components/engine/Hierarchie";
import { FolderDisplayer } from "@/components/engine/FolderDisplayer";
import { BottomPanel } from "@/components/engine/BottomPanel";
import { MainScene } from "@/components/engine/MainScene";
import { Inspector } from "@/components/engine/Inspector";
import { Toolbar } from "@/components/engine/Toolbar";
import { EditorScreen } from "@/components/engine/EditorScreen";
import { PrefabsScene } from "@/PrefabsScene";

import { useSessionStore } from "@/store/useSessionStore";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { useEngineStore } from "@/store/engineStore";
import { useEffect } from "react";
import { useProjectStore } from "@/store/projectStore";
import { SaveProjectFile } from "@/lib/utils";
import { ProjectPanel } from "@/components/engine/ProjectPanel";
import { useSchemaStore } from "@/store/useSchemaStore";

function MainSceneHandler() {
  const { currentOnglet } = useSessionStore();

  return (
    <>
      <div className={currentOnglet === "scene" ? "w-full h-full" : "hidden"}>
        <MainScene />
      </div>
      <div className={currentOnglet === "console" ? "w-full h-full" : "hidden"}>
        <EditorScreen />
      </div>
      <div className={currentOnglet === "prefabs" ? "w-full h-full" : "hidden"}>
        <PrefabsScene />
      </div>
    </>
  );
}
export default function EnginePage() {
  const loadSchemas = useSchemaStore((s) => s.loadSchemas);

  useEffect(() => {
    loadSchemas();
  }, [loadSchemas]);

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
        await SaveProjectFile();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  const { currentProjectPath } = useProjectStore();

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
              {/* <SceneManager /> */}
              <ProjectPanel />
            </ResizablePanel>
            <ResizableHandle className="h-0.5 w-full bg-primary/20 cursor-row-resize" />
            <ResizablePanel minSize={40} defaultSize={300}>
              <Hierarchie />
            </ResizablePanel>
            <ResizableHandle className="h-0.5 w-full bg-primary/20 cursor-row-resize" />
            <ResizablePanel minSize={40} defaultSize={300}>
              <FolderDisplayer path={currentProjectPath} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle className="h-full w-0.5 bg-primary/20 cursor-col-resize" />
        <ResizablePanel>
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel minSize={200}>
              <MainSceneHandler />
            </ResizablePanel>
            <ResizableHandle className="h-0.5 w-full bg-primary/20 cursor-row-resize" />
            <BottomPanel />
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
