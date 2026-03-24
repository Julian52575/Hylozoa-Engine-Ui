import { Button } from "../ui/button";
import { Command, Child } from "@tauri-apps/plugin-shell";
import { useState, useRef } from "react";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

import { useEngineStore } from "@/store/engineStore";
import { Icon } from "@iconify/react";


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

export function Toolbar() {
  const [status, setStatus] = useState<"idle" | "running">("idle");
  const childRef = useRef<Child | null>(null);
  const windowRef = useRef<WebviewWindow | null>(null);

  async function launchHylozoa() {
    if (status === "running") return;

    try {
        const command = Command.sidecar("binaries/hylozoa", ["mon-argument"]);
        const child = await command.spawn();
        childRef.current = child;
        setStatus("running");

        const webview = await createNodeWindow();
        windowRef.current = webview;

        command.on("close", async () => {
            await closeGraphWindow();
            setStatus("idle");
            childRef.current = null;
        });
    } catch (error) {
        console.error("Failed to launch Hylozoa:", error);
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

    webview.once("tauri://error", (e) => {
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
