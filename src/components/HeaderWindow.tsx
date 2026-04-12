import { getCurrentWindow } from "@tauri-apps/api/window";
import { useState,useEffect } from "react";
import { Icon } from "@iconify/react";


import { Button } from "@/components/ui/button";
import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"

import { isTauri } from "@tauri-apps/api/core";

function ButtonsWindowHandler() {
    const appWindow = getCurrentWindow();
    const [isMaximized, setIsMaximized] = useState(false);
    useEffect(() => {
        appWindow.isMaximized().then(setIsMaximized);
        const unlisten = appWindow.onResized(async () => {
            const maximized = await appWindow.isMaximized();
            setIsMaximized(maximized);
        });
        return () => {
            unlisten.then((f) => f());
        };
    }, []);

    return (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <Button
                size={"icon-sm"}
                className="h-6 w-6 hover:bg-secondary/10"
                onClick={async () => {
                    await appWindow.minimize();
                }}
                aria-label="Minimize window"
            >
                <Icon icon="fa-regular:window-minimize" className="w-4 h-4" />
            </Button>
            <Button
                size={"icon-sm"}
                className="h-6 w-6 hover:bg-secondary/10"
                onClick={async () => {
                    await appWindow.toggleMaximize();
                }}
                aria-label={isMaximized ? "Restore window" : "Maximize window"}
            >
                {isMaximized ? <Icon icon="fa-regular:window-restore" className="w-4 h-4" /> : <Icon icon="fa-regular:window-maximize" className="w-4 h-4" />}
            </Button>
            <Button
                size={"icon-sm"}
                className="h-6 w-6 hover:bg-secondary/10"
                onClick={async () => {
                    await appWindow.close();
                }}
                aria-label="Close window"
            >
                <Icon icon="fa:close" className="w-4 h-4" />
            </Button>
        </div>
    )
}

function FileMenuGroup() {
    return (
        <MenubarMenu>
            <MenubarTrigger>
                File
            </MenubarTrigger>
            <MenubarContent>
                <MenubarGroup>
                    <MenubarItem>
                        New Tab <MenubarShortcut>⌘T</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem>
                        New Window <MenubarShortcut>⌘N</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem disabled>New Incognito Window</MenubarItem>
                </MenubarGroup>
                <MenubarSeparator />
                <MenubarGroup>
                    <MenubarSub>
                        <MenubarSubTrigger>Share</MenubarSubTrigger>
                        <MenubarSubContent>
                            <MenubarGroup>
                                <MenubarItem>Email link</MenubarItem>
                                <MenubarItem>Messages</MenubarItem>
                                <MenubarItem>Notes</MenubarItem>
                            </MenubarGroup>
                        </MenubarSubContent>
                    </MenubarSub>
                </MenubarGroup>
            </MenubarContent>
        </MenubarMenu>
    )
}

function WindowsMenuGroup() {
    return (
        <MenubarMenu>
            <MenubarTrigger>
                Window
            </MenubarTrigger>
            <MenubarContent>
                <MenubarGroup>
                    <MenubarItem>
                        Minimize <MenubarShortcut>⌘M</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem>
                        Zoom
                    </MenubarItem>
                </MenubarGroup>
            </MenubarContent>
        </MenubarMenu>
    )
}

function ProjectsMenuGroup() {
    return (
        <MenubarMenu>
            <MenubarTrigger>
                Projects
            </MenubarTrigger>
            <MenubarContent>
                <MenubarGroup>
                    <MenubarItem>
                        Run Project <MenubarShortcut>⌘R</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem>
                        Run Scene <MenubarShortcut>⇧⌘R</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem>
                        Build Project <MenubarShortcut>⇧⌘B</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem>
                        Build Project & Run <MenubarShortcut>⇧⌘Br</MenubarShortcut>
                    </MenubarItem>
                </MenubarGroup>
            </MenubarContent>
        </MenubarMenu>
    )
}


function FunctionsGroup({ isHome }: { isHome: boolean }) {
    return (
        <Menubar className="w-72 bg-transparent border-0">
            <img src={"assets/logo.webp"} alt="App Logo" className="size-6 m-2 select-none pointer-events-none" />
            {!isHome && 
                <div className="flex">
                    <FileMenuGroup />
                    <WindowsMenuGroup />
                    <ProjectsMenuGroup />
                </div>
            }
        </Menubar>
    )
}
        
            
type headerWindowProps = {
    isHome?: boolean;
}

export function HeaderWindow({isHome = false}: headerWindowProps) {
    if (!isTauri()) {
        return null;
    }
    const appWindow = getCurrentWindow();
    const [title, setTitle] = useState<string>("");

    useEffect(() => {
        async function fetchTitle() {
            const currentTitle = await appWindow.title();
            setTitle(currentTitle);
        }

        fetchTitle();
    }, [appWindow]);

    return (
        <div 
            data-tauri-drag-region 
            className="h-10 w-full bg-primary sticky top-0 text-primary-foreground flex items-center justify-between"
        >
            <FunctionsGroup isHome={isHome} />
            <span className="absolute left-1/2 -translate-x-1/2 text-sm pointer-events-none" aria-hidden>
                {title}
            </span>
            <ButtonsWindowHandler />
        </div>
    );
}