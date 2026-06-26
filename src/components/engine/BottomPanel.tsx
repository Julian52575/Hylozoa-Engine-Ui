import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCallback, useEffect, useState } from "react";

import { ResizablePanel } from "@/components/ui/resizable";
import { PanelImperativeHandle } from "react-resizable-panels";
import { useRef } from "react";

import { useTerminalStore } from "@/store/useTerminalStore";

import { useVirtualizer } from "@tanstack/react-virtual";

const typeClassMap: Record<string, string> = {
  success: "text-green-400",
  warning: "text-yellow-400",
  error: "text-red-400",
  info: "text-zinc-300",
};

function Console() {
  const messages = useTerminalStore((state) => state.messages);
  const containerRef = useRef<HTMLPreElement>(null);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 24,
    overscan: 10,
  });

  const wasAtBottom = useRef(true);
  useEffect(() => {
    if (wasAtBottom.current) {
      virtualizer.scrollToIndex(messages.length - 1);
    }
  }, [messages.length]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    wasAtBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 30;
  }, []);

  const getTypeClass = useCallback((type: string) => {
    return typeClassMap[type] ?? typeClassMap.info;
  }, []);

  return (
    <pre
      ref={containerRef}
      onScroll={handleScroll}
      className="w-full h-full bg-primary p-2 overflow-auto 
            [&::-webkit-scrollbar]:w-1
            [&::-webkit-scrollbar-track]:bg-zinc-900/20
            [&::-webkit-scrollbar-thumb]:bg-zinc-500
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-zinc-400
            "
    >
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((item) => {
          const message = messages[item.index];
          return (
            <div
              key={item.key}
              style={{ position: "absolute", top: item.start, width: "100%" }}
              className={getTypeClass(message.type) + " text-sm font-mono mb-1"}
            >
              {message.text}
            </div>
          );
        })}
      </div>
    </pre>
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
