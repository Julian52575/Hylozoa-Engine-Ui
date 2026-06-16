import { Button } from "../ui/button";
import { Child } from "@tauri-apps/plugin-shell";
import { useState, useRef } from "react";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

import { useEngineStore } from "@/store/engineStore";
import { Icon } from "@iconify/react";

import { runHylozoa } from "@/lib/engineAPI";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useSessionStore } from "@/store/useSessionStore";

function HistoryButtons() {
  const temporal = (useEngineStore as any).temporal;
  return (
    <div className="flex flex-row gap-1">
      <Button
        variant="outline"
        size={"icon-sm"}
        className="cursor-pointer"
        onClick={() => temporal.getState().undo()}
      >
        <Icon icon="lucide:undo-2" className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size={"icon-sm"}
        className="cursor-pointer"
        onClick={() => temporal.getState().redo()}
      >
        <Icon icon="lucide:redo-2" className="w-4 h-4" />
      </Button>
    </div>
  );
}

function OngletButtons() {
  const { currentOnglet, setCurrentOnglet } = useSessionStore();

  return (
    <div className="flex flex-row gap-1">
      <Button
        variant={currentOnglet === "scene" ? "outline" : "ghost"}
        className="cursor-pointer"
        onClick={() => setCurrentOnglet("scene")}
      >
        Scene
      </Button>
      <Button
        variant={currentOnglet === "prefabs" ? "outline" : "ghost"}
        className="cursor-pointer"
        onClick={() => setCurrentOnglet("prefabs")}
      >
        Prefabs
      </Button>
      <Button
        variant={currentOnglet === "console" ? "outline" : "ghost"}
        className="cursor-pointer"
        onClick={() => setCurrentOnglet("console")}
      >
        Scripts
      </Button>
    </div>
  );
}

export function Toolbar() {
  const [status, setStatus] = useState<"idle" | "running">("idle");
  const childRef = useRef<Child | null>(null);
  const windowRef = useRef<WebviewWindow | null>(null);

  const addMessageInfo = useTerminalStore((state) => state.addMessageInfo);
  const addMessageError = useTerminalStore((state) => state.addMessageError);
  const clearMessages = useTerminalStore((state) => state.clearMessages);

  async function launchHylozoa() {
    if (status === "running") return;

    try {
      clearMessages();
      const child = await runHylozoa({
        onStdout: (line) => {
          addMessageInfo(line);
        },
        onStderr: (line) => {
          addMessageError(line);
        },
        onClose: async () => {
          await closeGraphWindow();
          setStatus("idle");
          childRef.current = null;
        },
      });
      childRef.current = child;
      setStatus("running");

      const webview = await createNodeWindow();
      windowRef.current = webview;
    } catch (error) {
      console.error("Failed to launch Hylozoa:", error);
      addMessageError("Failed to launch Hylozoa.");
    }
  }

  const closeGraphWindow = async () => {
    if (windowRef.current) {
      await windowRef.current.close();
      windowRef.current = null;
    }
  };

  async function handleStop() {
    if (childRef.current) {
      await childRef.current.kill();
    }
    await closeGraphWindow();
    setStatus("idle");
  }

  const createNodeWindow = async () => {
    const webview = new WebviewWindow("graph-window", {
      url: "/graph",
      decorations: false,
      title: "Graph View",
      width: 800,
      height: 600,
    });
    webview.once("tauri://created", () => {
      console.log("Graph window created");
    });

    webview.once("tauri://error", (e: any) => {
      console.error("Error creating graph window:", e);
    });
    webview.once("tauri://close-requested", async () => {
      await closeGraphWindow();
    });
    return webview;
  };

  return (
    <div className="w-full h-12 bg-primary/10 flex items-center px-2 gap-2 justify-around border-b border-primary/20">
      <HistoryButtons />
      <OngletButtons />
      <div className="flex flex-row gap-1">
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={launchHylozoa}
          disabled={status === "running"}
        >
          {status === "running" ? (
            <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
          ) : (
            <Icon icon="lucide:play" className="w-4 h-4" />
          )}
          <span>Play</span>
        </Button>
        <Button
          variant="outline"
          className="cursor-pointer active:scale-95 "
          onClick={handleStop}
          disabled={status === "idle"}
        >
          <Icon icon="lucide:square" className="w-4 h-4" fill="currentColor" />
          <span>Stop</span>
        </Button>
      </div>
    </div>
  );
}
