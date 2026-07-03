import Editor, { Monaco } from "@monaco-editor/react";
import { useState, useEffect, useRef } from "react";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs"; // Le lecteur de fichier de Tauri v2
import { Button } from "@/components/ui/button";
import { open } from "@tauri-apps/plugin-dialog";
import { useProjectStore } from "@/store/projectStore";
import { useSessionStore } from "@/store/useSessionStore";
import { Icon } from "@iconify/react";

import { registerHylozoaLuaProvider } from "./luaCompletions";
import { registerHylozoaLuaTheme } from "./luaSyntaxTheme";

interface EditorManagerProps {
  filePath: string | null;
  language?: string;
}

function FileEditor({ filePath, language = "lua" }: EditorManagerProps) {
  const [fileContent, setFileContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [saveStatus, setSaveStatus] = useState<
    "synced" | "modified" | "saving" | "error"
  >("synced");
  const contentRef = useRef(fileContent);

  useEffect(() => {
    async function loadFile() {
      try {
        if (!filePath) return;
        setLoading(true);
        const content = await readTextFile(filePath);
        setFileContent(content);
        contentRef.current = content;
        setSaveStatus("synced");
      } catch (err) {
        console.error("Erreur lors de la lecture du fichier .lua :", err);
        setSaveStatus("error");
      } finally {
        setLoading(false);
      }
    }
    if (filePath) {
      loadFile();
    }
  }, [filePath]);

  useEffect(() => {
    if (!filePath) return;
    if (saveStatus !== "modified") return;

    const delayDebounceTimer = setTimeout(async () => {
      try {
        setSaveStatus("saving");
        await writeTextFile(filePath, contentRef.current);
        setSaveStatus("synced");
      } catch (err) {
        console.error("Erreur lors de l'écriture du fichier .lua :", err);
        setSaveStatus("error");
      }
    }, 1000);

    return () => clearTimeout(delayDebounceTimer);
  }, [saveStatus, filePath]);

  const handleEditorChange = (value: string | undefined) => {
    const newValue = value || "";
    setFileContent(newValue);
    contentRef.current = newValue;
    if (saveStatus === "synced" || saveStatus === "error") {
      setSaveStatus("modified");
    }
  };

  const handleEditorWillMount = (monaco: Monaco) => {
    if (!(monaco as any).__hylozoaLuaThemeRegistered) {
      (monaco as any).__hylozoaLuaThemeRegistered = true;
      registerHylozoaLuaTheme(monaco);
    }

    if (!(monaco as any).__hylozoaLuaCompletionRegistered) {
      (monaco as any).__hylozoaLuaCompletionRegistered = true;
      registerHylozoaLuaProvider(monaco);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 text-sm text-zinc-400 gap-2">
        <Icon icon="lucide:loader-2" className="h-4 w-4 animate-spin" />{" "}
        Chargement du script...
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Editor
        defaultLanguage={language}
        theme="hylozoa-lua-theme"
        value={fileContent}
        onChange={handleEditorChange}
        beforeMount={handleEditorWillMount}
        options={{
          wordBasedSuggestions: "currentDocument",
          quickSuggestions: true,
        }}
      />
    </div>
  );
}

export function EditorScreen() {
  const { currentCodeFilePaths, addCodeFilePaths, removeCodeFilePath } =
    useSessionStore();
  const { currentProjectPath } = useProjectStore();
  const [selectedScript, setSelectedScript] = useState<string | null>(null);

  const handleFileSelect = async () => {
    try {
      const selected = await open({
        defaultPath: currentProjectPath || undefined,
        multiple: false,
        title: "Select a .lua file",
        filters: [
          {
            name: "Lua Files",
            extensions: ["lua"],
          },
        ],
      });

      if (selected && typeof selected === "string") {
        addCodeFilePaths(selected);
        setSelectedScript(selected);
      }
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };

  useEffect(() => {
    if (currentCodeFilePaths && currentCodeFilePaths.length > 0) {
      setSelectedScript(currentCodeFilePaths[currentCodeFilePaths.length - 1]);
    }
  }, [currentCodeFilePaths]);

  if (!currentCodeFilePaths || currentCodeFilePaths.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
        No file selected
        <Button onClick={handleFileSelect}>Select a file</Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex overflow-hidden">
      {currentCodeFilePaths.length > 0 && (
        <div className="h-full flex flex-col gap-1 p-2 border-r border-gray-300 overflow-y-scroll min-w-[160px]">
          {currentCodeFilePaths.map((filePath) => (
            <div
              key={filePath}
              title={filePath}
              className={`
                group flex items-center justify-between gap-2 px-2 py-1 rounded cursor-pointer
                border border-transparent hover:border-gray-200 hover:bg-gray-100
                ${selectedScript === filePath ? "bg-gray-100 border-gray-200" : ""}
              `}
            >
              <span
                className="text-sm truncate flex-1 min-w-0"
                onClick={() =>
                  selectedScript !== filePath && setSelectedScript(filePath)
                }
              >
                {filePath.split("/").pop()}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="shrink-0 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 cursor-pointer"
                onClick={() => removeCodeFilePath(filePath)}
              >
                <Icon icon="mdi:close" className="h-3 w-3 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <div className="w-full h-full mt-2 relative">
        {currentCodeFilePaths.map((filePath) => (
          <div
            key={filePath}
            className="absolute inset-0"
            style={{ display: selectedScript === filePath ? "block" : "none" }}
          >
            <FileEditor filePath={filePath} />
          </div>
        ))}
      </div>
    </div>
  );
}
