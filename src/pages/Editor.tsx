
import { HeaderWindow } from "@/components/HeaderWindow";

import {Hierarchie} from "@/components/editor/Hierarchie";
import {FolderDisplayer} from "@/components/editor/FolderDisplayer";
import { ConsoleDisplayer } from "@/components/editor/ConsoleDisplayer";
import { MainScene } from "@/components/editor/MainScene";
import { Inspector } from "@/components/editor/Inspector";
import { Toolbar } from "@/components/editor/Toolbar";
import { Viewport } from "@/components/editor/Viewport";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export default function EditorPage() {
    return (
    <div className="h-svh w-svw flex flex-col">
        <HeaderWindow isHome={false}/>
        <ResizablePanelGroup className="h-full flex">
            <ResizablePanel minSize={150} defaultSize={300} className="flex flex-col">
            <ResizablePanelGroup className="h-full flex flex-col" orientation="vertical">
                <ResizablePanel minSize={100} defaultSize={300}>
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
                <div className="w-full h-full flex flex-col">
                    <div className="flex-1 border-b border-zinc-300">
                    <Toolbar />
                    </div>
                    <div className="flex-1">
                    <Viewport />
                    </div>
                </div>
                </ResizablePanel>
                <ResizableHandle className="h-0.5 w-full bg-primary/20 cursor-row-resize" />
                <ResizablePanel minSize={200}>
                <MainScene />
                </ResizablePanel>
                <ResizableHandle className="h-0.5 w-full bg-primary/20 cursor-row-resize" />
                <ResizablePanel minSize={150} defaultSize={200}>
                <ConsoleDisplayer />
                </ResizablePanel>
            </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle className="h-full w-0.5 bg-primary/20 cursor-col-resize" />

            <ResizablePanel minSize={150} defaultSize={300}>
            <Inspector />
            </ResizablePanel>

        </ResizablePanelGroup>
    </div>
    )
}
