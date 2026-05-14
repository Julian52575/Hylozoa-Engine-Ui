import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { convertFileSrc } from "@tauri-apps/api/core";
import DEFAULT_IMG from "@/assets/logo.webp";
import { resolveResource } from "@tauri-apps/api/path";
import { useProjectStore } from "@/store/projectStore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAssetUrl(path: string | null) {
  if (!path) {
    return DEFAULT_IMG;
  }

  if (path.startsWith("http")) {
    return path;
  }
  return convertFileSrc(path);
}

export const resolveAssetPath = async (
  path: string | null | undefined,
  origin: string,
): Promise<string | null> => {
  if (!path) return null;

  const isAbsolute = path.startsWith("/") || /^[a-zA-Z]:[/\\]/.test(path);
  if (isAbsolute) return path;

  try {
    const { currentProjectPath } = useProjectStore.getState();
    if (!currentProjectPath) return null;

    return `${currentProjectPath}/${origin}/${path}`.replace(/[/\\]+/g, "/");
  } catch (error) {
    console.error("Erreur lors de la résolution du chemin Asset:", error);
    return null;
  }
};