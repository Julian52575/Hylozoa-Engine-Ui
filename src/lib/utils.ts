import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { convertFileSrc } from "@tauri-apps/api/core";
import DEFAULT_IMG from "@/assets/logo.webp";

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
