import { useEffect, useState } from "react";

import { open } from "@tauri-apps/plugin-dialog";
import { homeDir, join } from '@tauri-apps/api/path';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import  { Label } from "@/components/ui/label";
import { toast } from "sonner"

import { FaPlus } from "react-icons/fa6";
import { FaFolderOpen, FaCheckCircle} from "react-icons/fa";
import { MdOutlineError } from "react-icons/md";

import { useProjectStore, Project } from "@/store/projectStore";

function TriggerButton() {
    return (
        <DialogTrigger asChild>
            <Button className="cursor-pointer">
                <FaPlus/>
                Create
            </Button>
        </DialogTrigger>
    );
}

function Header() {
    return (
        <DialogHeader>
            <DialogTitle>
                Create New Project
            </DialogTitle>
            <DialogDescription>
                Enter the details for your new project.
            </DialogDescription>
        </DialogHeader>
    )
} 

function Footer({onCancel, onCreate} : {onCancel: () => void, onCreate: () => void}) {
    return (
        <div className="flex w-full items-center justify-center gap-2">
            <Button className="cursor-pointer" variant="outline" onClick={onCancel}>
                Cancel
            </Button>
            <Button className="cursor-pointer" onClick={onCreate}>
                Create
            </Button>
        </div>
    )
}

export default function CreateButton() {
    const defaultName = "New Project";

    const projectStore = useProjectStore();
    const addProject = projectStore.addProject;
    
    const [folderPath, setFolderPath] = useState<string>("");
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [projectName, setProjectName] = useState<string>(defaultName);
    const [errorFolder, setErrorFolder] = useState<string | null>(null);

    useEffect(() => {
      const initializeFolder = async () => {
        try {
            const home = await homeDir();
            const defaultFolderPath = await join(home, defaultName);
            setFolderPath(defaultFolderPath);
        } catch (error) {
            setFolderPath("");
        }
      };
      initializeFolder();
    }, [openDialog]);
    
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
            <TriggerButton />
            <DialogContent>
                <Header />
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="project-name" className="font-semibold ">
                        Project Name
                    </Label>
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
                  <Footer onCancel={() =>{setOpenDialog(false); reinitializeForm()}} onCreate={handleCreateProject} />
                </div>
            </DialogContent>
        </Dialog>
    )
}