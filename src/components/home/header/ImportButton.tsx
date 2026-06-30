import { useProjectStore, Project } from "@/store/projectStore";
import { open } from "@tauri-apps/plugin-dialog";
import { toast } from "sonner"
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { homeDir } from "@tauri-apps/api/path";
import { stat } from "@tauri-apps/plugin-fs";

export default function ImportButton() {
    const projectStore = useProjectStore();

    async function openProject() {
        try {
            const selected = await open({
                multiple: false,
                directory: false,
                defaultPath: await homeDir(),
                filters: [
                    { name: "HLZ Files", extensions: ["hlz"] },
                ],
            });
            if (!selected) {
                return;
            }
            const name = selected.split("/").pop()?.replace(".hlz", "") || "Imported Project";
            const path = selected.split("/").slice(0, -1).join("/");
            if (projectStore.projects.map(p => p.folderPath).includes(path)) {
              toast.error("This project folder is already imported.");
              return;
            }
            const fileStat = await stat(selected);
            const modifiedDate = fileStat.mtime ? new Date(fileStat.mtime) : new Date();
            const newProject: Project = {
              name: name,
              folderPath: path,
              version: "1.0.0",
              modifiedDate: modifiedDate,
              logo: "assets/logo.webp",
              isFavorite: false,
            };
            projectStore.addProject(newProject);
            toast.success("Project file selected successfully.");
        } catch (error) {
            toast.error("Failed to open project file.");
        }
    }
    return ( 
        <Button onClick={openProject} className="cursor-pointer">
            <Icon icon="fa-solid:folder-open" className="w-4 h-4" />
            Import
        </Button>
    );
}