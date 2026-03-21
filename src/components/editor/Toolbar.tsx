import { Button } from "../ui/button";
import { FaPlay, FaSpinner, FaStop } from "react-icons/fa";
import { Command, Child } from "@tauri-apps/plugin-shell";
import { useState, useRef } from "react";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

import { GrRedo, GrUndo } from "react-icons/gr";
import { useEngineStore } from "@/store/engineStore";

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
        <GrUndo />
      </Button>
      <Button
        variant="outline"
        size={"icon-sm"}
        className="cursor-pointer"
        onClick={() => temporal.getState().redo()}
      >
        <GrRedo />
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
            <FaSpinner className="animate-spin mr-0.5" />
          ) : (
            <FaPlay className="ml-0.5" />
          )}
          <span>Play</span>
        </Button>
        <Button
          variant="outline"
          className="cursor-pointer active:scale-95 "
          onClick={handleStop}
          disabled={status === "idle"}
        >
          <FaStop />
          <span>Stop</span>
        </Button>
      </div>
    </div>
  );
}
