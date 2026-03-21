import { Button } from "../ui/button";
import { FaPlay, FaSpinner, FaStop } from "react-icons/fa";
import { Command, Child } from "@tauri-apps/plugin-shell";
import { useState, useRef } from "react";

export function Toolbar() {
  const [status, setStatus] = useState<"idle" | "running">("idle");
  const childRef = useRef<Child | null>(null);

  async function launchHylozoa() {
    if (status === "running") return;

    const command = Command.sidecar("binaries/hylozoa", ["mon-argument"]);
    const child = await command.spawn();
    childRef.current = child;

    setStatus("running");

    command.on("close", () => {
      setStatus("idle");
      childRef.current = null;
    });
  }

  async function handleStop() {
    if (childRef.current) {
      await childRef.current.kill();
      setStatus("idle");
      childRef.current = null;
    }
  }

  return (
    <div className="w-full h-12 bg-primary/10 flex items-center px-2 gap-2 justify-center border-b border-primary/20">
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
  );
}
