import { Label } from "@/components/ui/label";
import { ImageIcon, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { open } from "@tauri-apps/plugin-dialog";
import { useState, useEffect } from "react";
import { getAssetUrl } from "@/lib/utils";
import { useProjectStore } from "@/store/projectStore";
import { resolveAssetPath } from "@/lib/utils";

const isPathInside = (parent: string, child: string) => {
  const normalizedParent = parent.replace(/[/\\]/g, "/");
  const normalizedChild = child.replace(/[/\\]/g, "/");
  return normalizedChild.startsWith(normalizedParent);
};

function ImageInput({
  image: initialImage,
  text = "Select an image",
  origin = "Assets",
  onImageChange,
}: {
  image?: string;
  text?: string;
  origin?: string;
  onImageChange?: (image: string) => void;
}) {
  const { currentProjectPath } = useProjectStore();
  const [localImage, setLocalImage] = useState<string | undefined>(
    initialImage,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setLocalImage(initialImage);
  }, [initialImage]);

  useEffect(() => {
    let isMounted = true;

    const updatePreview = async () => {
      if (!localImage) {
        setPreviewUrl(null);
        return;
      }

      const absolutePath = await resolveAssetPath(localImage, origin);
      if (absolutePath && isMounted) {
        setPreviewUrl(getAssetUrl(absolutePath));
      }
    };

    updatePreview();
    return () => {
      isMounted = false;
    };
  }, [localImage, origin, currentProjectPath]);

  const loadImage = async () => {
    try {
      const basePath = `${currentProjectPath}/${origin}`;

      const selected = await open({
        multiple: false,
        title: "Choisir une image",
        defaultPath: basePath,
        filters: [
          { name: "Images", extensions: ["jpg", "jpeg", "png", "gif", "svg"] },
        ],
      });

      if (selected && typeof selected === "string") {
        if (isPathInside(basePath, selected)) {
          const relativePath = selected
            .replace(basePath, "")
            .replace(/^[/\\]/, "");

          setLocalImage(relativePath);
          onImageChange?.(relativePath);
        } else {
          alert(
            "L'image sélectionnée doit se trouver dans le dossier " +
              origin +
              " du projet.",
          );
        }
      }
    } catch (error) {
      console.error("Error selecting image:", error);
    }
  };

  const getFileName = () => {
    if (!localImage) return text;
    return localImage.split(/[/\\]/).pop() || text;
  };

  return (
    <Button
      variant="outline"
      onClick={loadImage}
      className="relative h-14 w-full flex items-center justify-start gap-4 px-3 hover:bg-accent transition-all group hover:cursor-pointer"
    >
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="h-full w-full object-contain"
            onError={() => setPreviewUrl(null)} // Sécurité si l'image ne charge pas
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex flex-col items-start gap-0.5 overflow-hidden">
        <span
          className="text-sm font-medium leading-none truncate w-full"
          title={getFileName()}
        >
          {getFileName()}
        </span>
        <span className="text-xs text-muted-foreground truncate">
          {previewUrl ? "Changer l'image" : "Aucune image sélectionnée"}
        </span>
      </div>
      <FolderOpen className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </Button>
  );
}

export function ImageAccept({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (newValue: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 p-3 bg-zinc-50/50 rounded-lg border border-zinc-200 transition-all hover:border-zinc-300">
      <div className="px-1">
        <Label
          htmlFor={label}
          className="text-sm font-semibold text-zinc-500 cursor-pointer"
        >
          {label}
        </Label>
      </div>
      <ImageInput image={value} onImageChange={onChange} />
    </div>
  );
}
