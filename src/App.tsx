import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

import { Button } from "@/components/ui/button";


type FileEntry = {
  name: string;
  path: string;
  is_dir: boolean;
  children?: FileEntry[];
};

function App() {
  const [folderContent, setFolderContent] = useState<FileEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function openFolder() {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });
      if (!selected) {
        return;
      }
      const path = Array.isArray(selected) ? selected[0] : selected;

      const content = await invoke<FileEntry>('read_dir_recursively', { path });
      setFolderContent(content);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <main className="flex flex-col">
      <Button type="submit" onClick={openFolder}>
        Select Folder
      </Button>
      {error && <p className="text-red-600">{error}</p>}
      {folderContent && (
        <pre className="mt-4">
          {JSON.stringify(folderContent, null, 2)}
        </pre>
      )}
    </main>
  );
}

export default App;
