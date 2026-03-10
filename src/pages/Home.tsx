import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-menubar";
import { HeaderWindow } from "@/components/layout/HeaderWindow";
import { FaPlus } from "react-icons/fa6";
import { FaPen } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa6";
import { FaFolderOpen } from "react-icons/fa";
import { LuTextCursor } from "react-icons/lu";
import { FaPlay } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";

import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

import { useNavigate } from "react-router-dom";

import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";


type FileEntry = {
  name: string;
  path: string;
  is_dir: boolean;
  children?: FileEntry[];
};



function ImportFolderButton() {
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
            const content = await invoke<FileEntry>('read_dir_recursively', { path : selected });
            setFolderContent(content);
            setError(null);
        } catch (error) {
        setError(error instanceof Error ? error.message : String(error));
        }
    }
    return ( 
        <Button onClick={openFolder}>
            <FaFolderOpen/>
            Import
            {error && <p className="text-red-600">{error}</p>}
        </Button>
    );
}

interface ProjectCardProps {
    name: string;
    folderPath: string;
    version: string;
    modifiedDate: Date;
    logo: string;
    isFavorite: boolean;
}

function ProjectCard({
  logo,
  isFavorite,
  name,
  folderPath,
  version,
  modifiedDate,
 }: ProjectCardProps) {
  return (
    <div className="flex flex-row p-2 items-center gap-2 bg-zinc-100 h-20 border-b border-zinc-200">
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
              {modifiedDate.toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate();

  const handleProjectClick = () => {
    navigate("/editor");
  }

  return (
    <div className="h-svh w-svw flex flex-col">
      <HeaderWindow isHome />
      <div className="w-full flex items-center justify-center gap-1.5 p-2 bg-secondary border-b border-zinc-200">
        <Button>
          <FaPlus/>
          Create
        </Button>
        <ImportFolderButton />
        <Input placeholder="Search" />
        <div className="flex items-center gap-1">
          <Label className="text-sm">
            Sort:
          </Label>
          <Select>
            <SelectTrigger className="w-[150px] bg-white border-zinc-200 focus:ring-1 focus:ring-zinc-400 focus:ring-offset-0 transition-all font-medium h-8 text-sm">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent 
              position="popper" 
              sideOffset={-5}
              className="w-full"
            >
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="dateCreated">Date Created</SelectItem>
              <SelectItem value="dateModified">Date Modified</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex-1 flex flex-row">
        <div className="flex-[0.85] overflow-auto">
          <ProjectCard 
            name="Projet 1"
            folderPath="/Users/username/Projects/Projet1"
            version="v1.0.0"
            modifiedDate={new Date(2024, 5, 10)}
            logo="https://www.agera.asso.fr/app/uploads/2020/08/Projet.jpg"
            isFavorite={true}
          />
          <ProjectCard 
            name="Projet Alpha"
            folderPath="/Users/username/Projects/ProjetAlpha"
            version="v1.0.0"
            modifiedDate={new Date(2024, 5, 10)}
            logo="https://www.agera.asso.fr/app/uploads/2020/08/Projet.jpg"
            isFavorite={true}
          />
          <ProjectCard 
            name="Autre Projet"
            folderPath="/Users/username/Projects/AutreProjet"
            version="v1.0.0"
            modifiedDate={new Date(2024, 5, 10)}
            logo="https://www.agera.asso.fr/app/uploads/2020/08/Projet.jpg"
            isFavorite={true}
          />
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
  
          <Button className="w-full relative flex items-center justify-center" variant="destructive">
            <FaTrash className="absolute left-3 scale-75" />
            <span>Remove</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
