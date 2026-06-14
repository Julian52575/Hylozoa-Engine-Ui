import { open } from "@tauri-apps/plugin-dialog";
import { Label } from "@/components/ui/label";
import { FileCode, UploadCloud,FolderOpen } from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import { isPathInside } from "@/lib/utils";

interface ScriptAcceptProps {
  label: string;
  value: string;
  origin?: string;
  onChange: (newValue: string) => void;
}

export function ScriptAccept({ label, value, origin = "Assets", onChange }: ScriptAcceptProps) {
  const extensions = ["lua"];
  const { currentProjectPath } = useProjectStore();

  const handleSelectFile = async () => {
    try {
        const basePath = `${currentProjectPath}/${origin}`;

      const selected = await open({
        multiple: false,
        defaultPath: basePath,
        directory: false,
        title: `Sélectionner le script : ${label}`,
        filters: [
          {
            name: "Scripts",
            extensions: extensions,
          },
        ],
      });

      if (selected && typeof selected === "string") {
        if (isPathInside(basePath, selected)) {
            const relativePath = selected
                .replace(basePath, "")
                .replace(/^[/\\]/, "");
            onChange(relativePath);
        }
        else {
            alert(`Le fichier sélectionné n'est pas dans le dossier ${origin}.`);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la sélection du fichier Tauri:", error);
    }
  };

  const getFileName = (path: string) => {
    if (!path) return "";
    return path.split(/[/\\]/).pop() || path;
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-zinc-50/30 rounded-xl border border-zinc-200/80 shadow-sm transition-all hover:bg-zinc-50/80">
      <div className="px-1 flex justify-between items-center">
        <Label className="text-sm font-semibold  text-zinc-500">
          {label}
        </Label>
      </div>

      {value ? (
        <button 
            className="
                flex items-center justify-between 
                gap-3 bg-white border border-zinc-200 shadow-sm rounded-lg 
                p-2.5 text-sm animate-in fade-in zoom-in-95 duration-150
                hover:bg-zinc-50/50 hover:border-zinc-300
                hover:cursor-pointer
            "
            onClick={handleSelectFile}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="p-2 bg-zinc-100 rounded-md text-zinc-600 shrink-0">
              <FileCode className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span
                className="font-medium text-zinc-800 truncate text-left pb-0.5"
                title={getFileName(value)}
              >
                {getFileName(value)}
              </span>
              <span
                className="text-xs text-zinc-400 truncate"
                title={value}
              >
                {value}
              </span>
            </div>
            <FolderOpen className="ml-auto h-4 w-4 text-zinc-400 transition-colors group-hover:text-primary" />
          </div>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSelectFile}
          className="flex flex-col items-center justify-center gap-1.5 w-full bg-white border border-dashed border-zinc-300 rounded-lg py-4 px-3 text-center cursor-pointer transition-all hover:border-zinc-400 hover:bg-zinc-50/50 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
        >
          <UploadCloud className="h-5 w-5 text-zinc-400" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-zinc-700">
              Choisir un script
            </span>
            <span className="text-[11px] text-zinc-400">
              {extensions.length > 0
                ? `${extensions.join(", ").toUpperCase()}`
                : "Aucune restriction d'extension"}
            </span>
          </div>
        </button>
      )}
    </div>
  );
}
