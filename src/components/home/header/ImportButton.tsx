import { useProjectStore, Project } from "@/store/projectStore";
import { open } from "@tauri-apps/plugin-dialog";
import { toast } from "sonner"
import { Button } from "@/components/ui/button";
import { FaFolderOpen } from "react-icons/fa";


export default function ImportButton() {
    const projectStore = useProjectStore();

    async function openProject() {
        try {
            const selected = await open({
                multiple: false,
                directory: false,
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
            const newProject: Project = {
              name: name,
              folderPath: path,
              version: "1.0.0",
              modifiedDate: new Date(),
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
            <FaFolderOpen/>
            Import
        </Button>
    );
}