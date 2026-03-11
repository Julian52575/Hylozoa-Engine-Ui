
import { useState } from "react";

import { useProjectStore, Project } from "@/store/projectStore";
import { toast } from "sonner"
import { CardContainer } from "./CardManager";
import ButtonsContainer from "./ButtonsManager";
import Header from "./header";

export function Home({
    onEditProject,
    onRemoveProject,
} : {
    onEditProject?: () => void;
    onRemoveProject?: () => void;
}) {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortOption, setSortOption] = useState<string>("name");
    const projectStore = useProjectStore();
    const projects = projectStore.projects;
    const [projectSelected, setProjectSelected] = useState<Project | null>(null);

    const filteredProjects = projects.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.folderPath.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedProjects : Project[] = [...filteredProjects].sort((a, b) => {
        if (sortOption === "name") {
        return a.name.localeCompare(b.name);
        } else if (sortOption === "date") {
        return new Date(b.modifiedDate).getTime() - new Date(a.modifiedDate).getTime();
        } else if (sortOption === "path") {
        return a.folderPath.localeCompare(b.folderPath);
        } else if (sortOption === "favorite") {
        return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
        }
        return 0;
    });

    const handleProjectClick = () => {
        if (!projectSelected) {
            toast.error("Please select a project to edit.");
            return;
        }
        onEditProject && onEditProject();
    }

    const handleRemoveProject = () => {
        if (projectSelected) {
            projectStore.removeProject(projectSelected.folderPath);
            setProjectSelected(null);
            onRemoveProject && onRemoveProject();
        }
        else {
            toast.error("Please select a project to remove.");
        }
    };

    return (
        <div>
            <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} sortOption={sortOption} setSortOption={setSortOption} />
            <div className="flex-1 flex flex-row">
                <CardContainer 
                    projects={sortedProjects} 
                    projectSelected={projectSelected} 
                    setProjectSelected={setProjectSelected} 
                />
                <ButtonsContainer 
                    onEditProject={handleProjectClick}
                    onRemoveProject={handleRemoveProject}
                />
            </div>
      </div>
    );
}