import { Label } from "@/components/ui/label";
import { ImageIcon, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { open } from "@tauri-apps/plugin-dialog";
import { useState, useEffect } from "react";
import { getAssetUrl, resolveAssetPath } from "@/lib/utils";
import { resolveResource } from "@tauri-apps/api/path";

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
  const [localImage, setLocalImage] = useState<string | undefined>(
    initialImage,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const resolveAssetUrl = async (
    path: string | null | undefined,
  ): Promise<string | null> => {
    const absolutePath = await resolveAssetPath(path, origin);
    return absolutePath ? getAssetUrl(absolutePath) : null;
  };
  useEffect(() => {
    if (localImage) {
      resolveAssetUrl(localImage).then(setPreviewUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [localImage]);

  useEffect(() => {
    setLocalImage(initialImage);
  }, [initialImage]);

  const loadImage = async () => {
    const absoluteAssetsPath = await resolveResource(origin);

    const selected = await open({
      multiple: false,
      title: "Choisir une image",
      defaultPath: absoluteAssetsPath,
      filters: [
        { name: "Images", extensions: ["jpg", "jpeg", "png", "gif", "svg"] },
      ],
    });
    if (selected && typeof selected === "string") {
      if (isPathInside(absoluteAssetsPath, selected)) {
        let relativePath = selected
          .replace(absoluteAssetsPath, "")
          .replace(/^[/\\]/, "");
        setLocalImage(selected);
        onImageChange?.(relativePath);
      } else {
        alert(
          selected +
            " is not inside the assets folder. Please select an image from the assets folder.",
        );
      }
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
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md ">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Image preview"
            className="h-full w-full object-contain transition-transform"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center border bg-muted">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex flex-col items-start gap-0.5 overflow-hidden">
        <span
          className="text-sm font-medium leading-none"
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
