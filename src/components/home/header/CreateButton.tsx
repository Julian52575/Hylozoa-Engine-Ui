import { useEffect, useState } from "react";

import { open } from "@tauri-apps/plugin-dialog";
import { homeDir, join } from "@tauri-apps/api/path";
import { mkdir, exists, writeTextFile,readDir } from "@tauri-apps/plugin-fs";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Icon } from "@iconify/react";


import { useProjectStore, Project } from "@/store/projectStore";

function TriggerButton() {
  return (
    <DialogTrigger asChild>
      <Button className="cursor-pointer">
        <Icon icon="fa6-solid:plus" className="w-4 h-4" />
        Create
      </Button>
    </DialogTrigger>
  );
}

function Header() {
  return (
    <DialogHeader>
      <DialogTitle>Create New Project</DialogTitle>
      <DialogDescription>
        Enter the details for your new project.
      </DialogDescription>
    </DialogHeader>
  );
}

function Footer({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex w-full items-center justify-center gap-2">
      <Button className="cursor-pointer" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button className="cursor-pointer" onClick={onCreate}>
        Create
      </Button>
    </div>
  );
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

  const handleCreateProject = async () => {
    if (!folderPath.trim()) {
      setErrorFolder("Folder path cannot be empty.");
      return;
    }
    if (projectStore.projects.map((p) => p.folderPath).includes(folderPath)) {
      setErrorFolder("A project with this folder path already exists.");
      return;
    }

    try {
      const folderExists = await exists(folderPath);
      if (!folderExists) {
        await mkdir(folderPath, { recursive: true });
      }
      else {
        const entries = await readDir(folderPath);
        if (entries && entries.length > 0) {
          setErrorFolder("The selected folder is not empty. Please choose an empty folder or a new path.");
          return;
        }
      }
      const assetsPath = `${folderPath}/Assets`;
      const assetsExists = await exists(assetsPath);
      if (!assetsExists) {
        await mkdir(assetsPath);
      }
      const filePath = `${folderPath}/${projectName || defaultName}.hlz`;
      const fileContent = JSON.stringify(
        { name: projectName || defaultName, created: new Date() },
        null,
        2,
      );
      await writeTextFile(filePath, fileContent);

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
    } catch (error) {
      setErrorFolder("Failed to access the specified folder path.");
      console.error("Error accessing folder path:", error);
      return;
    }
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
  };

  const reinitializeForm = () => {
    setProjectName(defaultName);
    setErrorFolder(null);
  };

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
            <Input
              id="project-name"
              placeholder="My Awesome Project"
              className="w-full"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-2 items-center">
              <Label htmlFor="project-version" className="font-semibold">
                Folder path
              </Label>
              {errorFolder === null ? (
                <Icon icon="fa-solid:check-circle" className="w-4 h-4 text-green-600" />
              ) : (

                <Icon icon="fa-solid:exclamation-circle" className="w-4 h-4 text-red-500" />
              )}
              {errorFolder && (
                <span className="text-sm text-red-500 no-wrap">{errorFolder}</span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                id="project-version"
                placeholder="/path/to/project"
                className="w-full"
                value={folderPath}
                onChange={(e) => setFolderPath(e.target.value)}
              />
              <Button
                className=""
                variant="outline"
                size="icon"
                onClick={openFolderDialog}
              >
                <Icon icon="fa-solid:folder-open" className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Footer
            onCancel={() => {
              setOpenDialog(false);
              reinitializeForm();
            }}
            onCreate={handleCreateProject}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
