import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import { Button } from "@/components/ui/button";


type FileEntry = {
  name: string;
  path: string;
  is_dir: boolean;
  children?: FileEntry[];
};

function App() {
  const [folder, setFolder] = useState("");
  const [folderContent, setFolderContent] = useState<FileEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function openFolder(path:string) {
    try {
      const folderContent = await invoke('read_dir_recursively', { path });
      setFolderContent(folderContent as FileEntry);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <main className="flex flex-col">
      <form
        className="flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await openFolder(folder);
        }}
      >
        <input
          id="greet-input"
          className="bg-white"
          onChange={(e) => setFolder(e.currentTarget.value)}
          placeholder="Enter a folder path"
        />
        <Button type="submit">Open Folder</Button>
      </form>
      {error && <p className="text-red-600">{error}</p>}
      {folderContent && (
        <pre className="mt-4">{JSON.stringify(folderContent, null, 2)}</pre>
      )}
    </main>
  );
}

export default App;
