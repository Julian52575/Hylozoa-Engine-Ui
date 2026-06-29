import { Command } from "@tauri-apps/plugin-shell";
import { resolveResource } from "@tauri-apps/api/path";
import { tempDir, join } from "@tauri-apps/api/path";
import {
  writeTextFile,
  readTextFile
} from "@tauri-apps/plugin-fs";
import { SaveProjectFile } from "./utils";
import { useEngineStore } from "@/store/engineStore";

export const generateUint64Id = async (): Promise<string> => {
  const command = Command.sidecar("binaries/hylozoa", ["generate-uuid"]);
  let result = "";
  command.stdout.on("data", (line) => {
    result += line;
  });
  return new Promise((resolve, reject) => {
    command.on("close", () => {
      const trimmedResult = result.trim();
      if (trimmedResult) {
        resolve(trimmedResult);
      } else {
        reject(new Error("Failed to generate ID"));
      }
    });
    command.on("error", (err) => {
      reject(err);
    });
    command.spawn().catch(reject);
  });
};

export const createHylozoaCommand = async (projectPath: string) => {
  try {
    const saveResult = await SaveProjectFile();
    if (!saveResult) {
      throw new Error("Failed to save project file");
    }

    const tags = useEngineStore.getState().tags;
    const layers = useEngineStore.getState().layers;

    const settingsPath = await resolveResource(
      "ressources/EngineSettings.json",
    );
    const raw = await readTextFile(settingsPath);
    const settings = JSON.parse(raw);

    settings.ProjectLocation = projectPath;
    if (!settings.ProjectLocation.endsWith("/")) {
      settings.ProjectLocation += "/";
    }
    settings.Tags = tags;
    settings.Layers = layers;

    const tempSettingsPath = await join(await tempDir(), "EngineSettings.json");
    await writeTextFile(tempSettingsPath, JSON.stringify(settings, null, 2));

    const projectName = projectPath.split("/").filter(Boolean).pop() || "project";
    const fileProjectPath = projectPath + "/" + projectName + ".hlz";

    const command = Command.sidecar("binaries/hylozoa", [
      "run",
      tempSettingsPath,
      fileProjectPath
    ]);

    return command;
  } catch (error) {
    console.error("Failed to launch Hylozoa:", error);
    throw error;
  }
};

export const runHylozoa = async ({
  projectPath,
  onStdout,
  onStderr,
  onClose,
}: {
  projectPath: string;
  onStdout?: (line: string) => void;
  onStderr?: (line: string) => void;
  onClose?: () => void;
}) => {
  try {
    const command = await createHylozoaCommand(projectPath);
    if (!command) {
      throw new Error("Failed to create command");
    }
    if (onStdout) {
      command.stdout.on("data", onStdout);
    }
    if (onStderr) {
      command.stderr.on("data", onStderr);
    }
    if (onClose) {
      command.on("close", onClose);
    }
    const child = await command.spawn();
    return child;
  } catch (error) {
    console.error("Failed to run Hylozoa:", error);
    throw error;
  }
};
