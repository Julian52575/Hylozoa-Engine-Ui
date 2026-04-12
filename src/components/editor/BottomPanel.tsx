import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react";

import {
  ResizablePanel,
} from "@/components/ui/resizable";
import { PanelImperativeHandle } from "react-resizable-panels";
import { useRef } from "react";

function Console(){
    const messages = [
        { text: "Console Output:", type: "info" },
        { text: "Initializing application...", type: "info" },
        { text: "> Loading modules...", type: "info" },
        { text: "> Application started successfully.", type: "success" },
        { text: "Warning: Low memory detected.", type: "warning" },
        { text: "Error: Failed to load resource.", type: "error" },
        { text: "Tip: Use 'help' command to list available commands.", type: "info" },
        { text: "> help", type: "info" },
        { text: "Available commands: start, stop, restart, status", type: "info" },
        { text: "> status", type: "info" },
        { text: "Application is running smoothly.", type: "success" },
    ];
    const handleTypeClass = (type: string) => {
        switch(type) {            
            case "success":
                return "text-green-400";
            case "warning":
                return "text-yellow-400";
            case "error":
                return "text-red-400";
            case "info":
            default:
                return "text-zinc-300";
        }
    };

    return (
        <div className="w-full h-full bg-primary p-2 overflow-auto 
            [&::-webkit-scrollbar]:w-1
            [&::-webkit-scrollbar-track]:bg-zinc-900/20
            [&::-webkit-scrollbar-thumb]:bg-zinc-500
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-zinc-400"
        >
            {messages.map((message, index) => (
                <div key={index} className={handleTypeClass(message.type) + " font-mono text-sm mb-1"}>
                    {message.text}
                </div>
            ))}
        </div>
    )
}

export function BottomPanel() {
    const [selectedTab, setSelectedTab] = useState<string | null>(null);
    const bottomPanelRef = useRef<PanelImperativeHandle>(null);
    const toggleTab = (value: string) => {
        const isClosing = selectedTab === value;
        if (isClosing) {
            bottomPanelRef.current?.resize(40);
            setSelectedTab(null);
        } else {
            setSelectedTab(value);
            bottomPanelRef.current?.resize(300);
        }
    };

    return (
        <ResizablePanel minSize={40} defaultSize={40} panelRef={bottomPanelRef} className="transition-all duration-200">
            <Tabs className="w-full h-full justify-end" value={selectedTab || ""}> 
                <TabsContent value="Console" className="w-full h-full">
                    <Console />
                </TabsContent>
                <TabsContent value="password" className="w-full h-full">
                    Change your password here.
                </TabsContent>
                <TabsList className="flex ">
                        <TabsTrigger value="Console" onClick={() => toggleTab("Console")}>Console</TabsTrigger>
                        <TabsTrigger value="password" onClick={() => toggleTab("password")}>Password</TabsTrigger>
                </TabsList>
            </Tabs>
        </ResizablePanel>
    )
}