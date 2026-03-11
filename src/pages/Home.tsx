import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import  { Label } from "@/components/ui/label";
import { HeaderWindow } from "@/components/HeaderWindow";
import { FaPlus } from "react-icons/fa6";
import { FaPen } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa6";
import { FaFolderOpen } from "react-icons/fa";
import { LuTextCursor } from "react-icons/lu";
import { FaPlay } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { MdOutlineError } from "react-icons/md";

import { homeDir, join } from '@tauri-apps/api/path';

import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

import { useNavigate } from "react-router-dom";

import { open } from "@tauri-apps/plugin-dialog";
// import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

import { useProjectStore, Project } from "@/store/projectStore";
import { toast } from "sonner"


import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


// type FileEntry = {
//   name: string;
//   path: string;
//   is_dir: boolean;
//   children?: FileEntry[];
// };


function ImportFolderButton() {
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
              toast.error("This projet folder is already imported.");
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

type ProjectCardProps = Project & {
  onClick: (project: Project) => void;
  isSelected: boolean;
}

function ProjectCard({
  logo,
  isFavorite,
  name,
  folderPath,
  version,
  modifiedDate,
  onClick,
  isSelected,
 }: ProjectCardProps) {
  return (
    <div 
      className={`
        flex flex-row p-2 items-center gap-2 h-20 border cursor-pointer  hover:bg-secondary/50 rounded-md transition-colors
        ${isSelected ? "border-blue-500 " : "border-zinc-200"}
      `} 
      onClick={() => onClick({logo, isFavorite, name, folderPath, version, modifiedDate})}
    >
      <FaStar className="inline w-5" color={isFavorite ? "gold" : "gray"} />
      <img
        src={logo}
        alt="Project Thumbnail"
        className="w-20 h-full object-cover rounded-md"
      />
      <div className="w-full h-full flex flex-col justify-around gap-1">
        <span className="font-bold">
          {name}
        </span>
        <div className="w-full flex flex-row justify-between">
          <span className="text-sm text-zinc-600 overflow-hidden text-ellipsis max-w-xs">
            {folderPath}
          </span>
          <div className="flex gap-2 text-sm text-zinc-600">
            <span>
              {version}
            </span>
            <span>
              {new Date(modifiedDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}


function DialogCreateProject() {
    const projectStore = useProjectStore();
    const addProject = projectStore.addProject;

    async function getHomeDir() {
      try {
        const home = await homeDir();
        return home;
      } catch (error) {
        return "";
      }
    }
    const [folderPath, setFolderPath] = useState<string>("");
    const [openDialog, setOpenDialog] = useState<boolean>(false);


    useEffect(() => {
      const initializeFolder = async () => {
        const home = await getHomeDir();
        const defaultFolderPath = await join(home, "NewProject");
        setFolderPath(defaultFolderPath);
      };
      initializeFolder();
    }, [openDialog]);
    
    const defaultName = "New Project";

    const [projectName, setProjectName] = useState<string>(defaultName);
    const [errorFolder, setErrorFolder] = useState<string | null>(null);

    const handleCreateProject = () => {
      if (!folderPath.trim()) {
        setErrorFolder("Folder path cannot be empty.");
        return;
      }
      if (projectStore.projects.map(p => p.folderPath).includes(folderPath)) {
        setErrorFolder("A project with this folder path already exists.");
        return;
      }

      const newProject: Project = {
        name: projectName || defaultName,
        folderPath: folderPath,
        version: "1.0.0",
        modifiedDate: new Date(),
        logo: "assets/logo.webp",
        isFavorite: false,
      };
      addProject(newProject);
      setOpenDialog(false);
      toast.success("Project created successfully.");
    };

    const openFolderDialog = async () => {
      try {
          const selected = await open({
              multiple: false,
              directory: true,
          });
          if (!selected) {
              return;
          }
          setFolderPath(selected);
      } catch (error) {
        setErrorFolder("Failed to select folder.");
      }
    }

    const reinitializeForm = () => {
      setProjectName(defaultName);
      setErrorFolder(null);
    }

    return (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
                <Button className="cursor-pointer">
                    <FaPlus/>
                    Create
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Create New Project
                    </DialogTitle>
                    <DialogDescription>
                        Enter the details for your new project.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="project-name" className="font-semibold ">Project Name</Label>
                    <Input id="project-name" placeholder="My Awesome Project" className="w-full" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex gap-2 items-center">
                      <Label htmlFor="project-version" className="font-semibold">Folder path</Label>
                      {errorFolder === null ?
                        <FaCheckCircle className="inline" color="#07a417" size={16} />
                       : <MdOutlineError className="inline" color="#a10707" size={16} />}
                      {errorFolder && <span className="text-sm text-red-500">{errorFolder}</span>}
                    </div>
                    <div className="flex gap-2">
                      <Input id="project-version" placeholder="/path/to/project" className="w-full" value={folderPath} onChange={(e) => setFolderPath(e.target.value)} />
                      <Button className="" variant="outline" size="icon" onClick={openFolderDialog}>
                        <FaFolderOpen />
                      </Button>
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-center gap-2">
                    <Button className="cursor-pointer" variant="outline" onClick={() =>{setOpenDialog(false); reinitializeForm()}}>
                      Cancel
                    </Button>
                    <Button className="cursor-pointer" onClick={handleCreateProject}>
                      Create
                    </Button>
                  </div>
                </div>
            </DialogContent>
  
        </Dialog>
    )
}


export default function HomePage() {
  const navigate = useNavigate();

  const handleProjectClick = () => {
    if (!projetSelected) {
      toast.error("Please select a project to edit.");
      return;
    }
    navigate("/editor");
  }

  const projectStore = useProjectStore();
  const projects = projectStore.projects;
  const [projetSelected, setProjectSelected] = useState<Project | null>(null);
  
  const handleRemoveProject = () => {
    if (projetSelected) {
      projectStore.removeProject(projetSelected.folderPath);
      setProjectSelected(null);
    }
    else {
      toast.error("Please select a project to remove.");
    }
  };

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("name");

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.folderPath.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProjects = [...filteredProjects].sort((a, b) => {
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

  return (
    <div className="h-svh w-svw flex flex-col">
      <HeaderWindow isHome />
      <div className="w-full flex items-center justify-center gap-1.5 p-2 bg-secondary border-b border-zinc-200">
        <DialogCreateProject />
        <ImportFolderButton />
        <Input 
          placeholder="Search" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex items-center gap-1">
          <Label className="text-sm">
            Sort:
          </Label>
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[150px] bg-white border-zinc-200 focus:ring-1 focus:ring-zinc-400 focus:ring-offset-0 transition-all font-medium h-8 text-sm">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent 
              position="popper" 
              sideOffset={-5}
              className="w-full"
            >
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="path">Path</SelectItem>
              <SelectItem value="favorite">Favorite</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex-1 flex flex-row">
        <div className="flex-[0.85] overflow-auto flex flex-col gap-1 p-4">
          {sortedProjects.map((project) => (
            <ProjectCard 
              key={project.folderPath} 
              {...project} 
              onClick={setProjectSelected}
              isSelected={projetSelected?.folderPath === project.folderPath}
            />
          ))}
        </div>
        <div className="flex-[0.15] border-l border-zinc-200 flex flex-col p-2 gap-2">
          <Button className="w-full relative flex items-center justify-center cursor-pointer" onClick={handleProjectClick}>
            <FaPen className="absolute left-3 scale-75" />
            <span>Edit</span>
          </Button>
  
          <Button className="w-full relative flex items-center justify-center">
            <FaPlay className="absolute left-3 scale-75" />
            <span>Run</span>
          </Button>
  
          <Button className="w-full relative flex items-center justify-center">
            <LuTextCursor className="absolute left-3" />
            <span>Rename</span>
          </Button>
  
          <Button className="w-full relative flex items-center justify-center cursor-pointer" variant="destructive" onClick={handleRemoveProject}>
            <FaTrash className="absolute left-3 scale-75" />
            <span>Remove</span>
          </Button>
        </div>
      </div>
    </div>
  )
}