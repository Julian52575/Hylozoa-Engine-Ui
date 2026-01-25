
import { HeaderWindow } from "@/components/layout/HeaderWindow";
import {Hierarchie} from "@/components/layout/Hierarchie";
import {FolderDisplayer} from "@/components/layout/FolderDisplayer";
import { ConsoleDisplayer } from "@/components/layout/ConsoleDisplayer";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"


function App() {

  return (
    <div className="h-svh w-svw flex flex-col">
      <HeaderWindow />
      <ResizablePanelGroup className="h-full flex">
        <ResizablePanel minSize={150} defaultSize={300} className="flex flex-col">
          <ResizablePanelGroup className="h-full flex flex-col" orientation="vertical">
            <ResizablePanel minSize={100} defaultSize={150}>
              <Hierarchie />
            </ResizablePanel>
            <ResizableHandle className="h-0.5 w-full bg-primary/20 cursor-row-resize" />
            <ResizablePanel minSize={100} defaultSize={300}>
              <FolderDisplayer />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle className="h-full w-0.5 bg-primary/20 cursor-col-resize" />

        <ResizablePanel>
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel minSize={50} defaultSize={100}>
              <div className="w-full h-full bg-green-500 flex flex-col">
                <div className="flex-1 bg-red-500">
                  Toolbar
                </div>
                <div className="flex-1 bg-pink-500">
                  Viewport controls
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle className="h-0.5 w-full bg-primary/20 cursor-row-resize" />
            <ResizablePanel minSize={200}>
              <div className="w-full h-full bg-yellow-500">
                Main scene
              </div>
            </ResizablePanel>
            <ResizableHandle className="h-0.5 w-full bg-primary/20 cursor-row-resize" />
            <ResizablePanel minSize={150} defaultSize={200}>
              <ConsoleDisplayer />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle className="h-full w-0.5 bg-primary/20 cursor-col-resize" />

        <ResizablePanel minSize={150} defaultSize={300} className="flex flex-col bg-blue-500">
          <div>
            Inspector
          </div>
        </ResizablePanel>

      </ResizablePanelGroup>
    </div>
  );
}

export default App;
