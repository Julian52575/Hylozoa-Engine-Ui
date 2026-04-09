import { Command } from "@tauri-apps/plugin-shell";
import { resolveResource } from "@tauri-apps/api/path";
import { useEngineStore, exportToEngine } from "@/store/engineStore";
import { tempDir, join } from "@tauri-apps/api/path";
import { writeTextFile } from "@tauri-apps/plugin-fs";

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

export const createHylozoaCommand = async () => {
  try {
    const settingsPath = await resolveResource(
      "ressources/EngineSettings.json",
    );
    const engineState = useEngineStore.getState();
    const exportData = exportToEngine(engineState);
    const stringifiedData = JSON.stringify(exportData.scenes[0], null, 2);
    const tempPath = await join(await tempDir(), "scene.json");
    await writeTextFile(tempPath, stringifiedData);

    const command = Command.sidecar("binaries/hylozoa", [
      "run",
      settingsPath,
      tempPath,
    ]);
    return command;
  } catch (error) {
    console.error("Failed to launch Hylozoa:", error);
    throw error;
  }
};

export const runHylozoa = async ({
  onStdout,
  onStderr,
  onClose,
}: {
  onStdout?: (line: string) => void;
  onStderr?: (line: string) => void;
  onClose?: () => void;
}) => {
  try {
    const command = await createHylozoaCommand();
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
