import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

import { ResizablePanel } from "@/components/ui/resizable";
import { PanelImperativeHandle } from "react-resizable-panels";
import { useRef } from "react";

import { useTerminalStore } from "@/store/useTerminalStore";

function Console() {
  const messages = useTerminalStore((state) => state.messages);
  const handleTypeClass = (type: string) => {
    switch (type) {
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
    <div
      className="w-full h-full bg-primary p-2 overflow-auto 
            [&::-webkit-scrollbar]:w-1
            [&::-webkit-scrollbar-track]:bg-zinc-900/20
            [&::-webkit-scrollbar-thumb]:bg-zinc-500
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-zinc-400
            "
    >
      {messages.map((message, index) => (
        <div
          key={index}
          className={handleTypeClass(message.type) + " font-mono text-sm mb-1"}
        >
          {message.text}
        </div>
      ))}
    </div>
  );
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

  const isClosed = selectedTab === null;

  return (
    <ResizablePanel
      minSize={35}
      defaultSize={35}
      panelRef={bottomPanelRef}
      className="transition-all duration-200 overflow-hidden"
    >
      <Tabs
        className="w-full h-full flex flex-col justify-end bg-transparent shadow-none border-none data-[state=active]:shadow-none"
        value={selectedTab || ""}
      >
        {!isClosed && (
          <div className="h-[calc(100%-35px)] w-full overflow-hidden flex flex-col m-0 p-0">
            <TabsContent
              value="Console"
              className="w-full h-full m-0 p-0 border-none bg-transparent"
            >
              <Console />
            </TabsContent>
            <TabsContent
              value="password"
              className="w-full h-full m-0 p-0 border-none bg-transparent text-white"
            >
              Change your password here.
            </TabsContent>
          </div>
        )}

        <TabsList className="flex h-10 w-full justify-start items-stretch bg-primary/10 p-0 rounded-none overflow-hidden border-none shadow-none">
          <TabsTrigger
            value="Console"
            onClick={() => toggleTab("Console")}
            className="w-10 h-10 p-0 m-0 inline-flex items-center justify-center rounded-none data-[state=active]:text-black truncate select-none shadow-none border-none data-[state=active]:shadow-none data-[state=active]:bg-primary/20 hover:text-primary data-[state=active]:translate-y-0"
          >
            Console
          </TabsTrigger>
          <TabsTrigger
            value="password"
            onClick={() => toggleTab("password")}
            className="w-10 h-10 p-0 m-0 inline-flex items-center justify-center rounded-none data-[state=active]:text-black truncate select-none shadow-none border-none data-[state=active]:shadow-none data-[state=active]:bg-primary/20 hover:text-primary data-[state=active]:translate-y-0"
          >
            Password
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </ResizablePanel>
  );
}
