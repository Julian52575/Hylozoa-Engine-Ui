import { Project } from "@/store/projectStore";
import { FaStar } from "react-icons/fa6";

interface ProjectCardProps {
    project : Project;
    onClick: (project: Project) => void;
    isSelected: boolean;
}

export function ProjectCard({
  project,
  onClick,
  isSelected,
 }: ProjectCardProps) {
  return (
    <div 
      className={`
        flex flex-row p-2 items-center gap-2 h-20 border cursor-pointer  hover:bg-secondary/50 rounded-md transition-colors
        ${isSelected ? "border-blue-500 " : "border-zinc-200"}
      `} 
      onClick={() => onClick(project)}
    >
      <FaStar className={`inline hover:text-yellow-500 ${project.isFavorite ? "text-yellow-500" : "text-gray-500"}`} />
      <img
        src={project.logo}
        alt="Project Thumbnail"
        className="w-20 h-full object-cover rounded-md"
      />
      <div className="w-full h-full flex flex-col justify-around gap-1">
        <span className="font-bold">
          {project.name}
        </span>
        <div className="w-full flex flex-row justify-between">
          <span className="text-sm text-zinc-600 overflow-hidden text-ellipsis max-w-xs">
            {project.folderPath}
          </span>
          <div className="flex gap-2 text-sm text-zinc-600">
            <span>
              {project.version}
            </span>
            <span>
              {new Date(project.modifiedDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface CardContainerProps {
    projects: Project[];
    projectSelected: Project | null;
    setProjectSelected: (project: Project) => void;
}

export function CardContainer({ 
    projects, 
    projectSelected, 
    setProjectSelected
}: CardContainerProps) {
    return (
        <div className="flex-[0.85] overflow-auto flex flex-col gap-1 p-4">
            {projects.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <span className="text-lg text-zinc-600">Sorry, you have no projects with this name.</span>
                </div>
            )}
            {projects.map((project) => (
                <ProjectCard 
                    key={project.folderPath} 
                    project={project}
                    onClick={setProjectSelected}
                    isSelected={projectSelected?.folderPath === project.folderPath}
                />
            ))}
            
        </div>
    );
}