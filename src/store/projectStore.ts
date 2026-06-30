import { create } from "zustand";
import { persist } from "zustand/middleware";
import { join } from "@tauri-apps/api/path";
import { exists, stat, remove } from "@tauri-apps/plugin-fs";
export interface Project {
  name: string;
  folderPath: string;
  version: string;
  modifiedDate: Date;
  logo: string;
  isFavorite: boolean;
}

interface ProjectsState {
  projects: Project[];
  currentProjectPath: string;
  setCurrentProjectPath: (path: string) => void;
  addProject: (project: Project) => void;
  removeProject: (folderPath: string, deleteFolder: boolean) => Promise<void>;
  updateProject: (folderPath: string, updatedData: Partial<Project>) => void;
  checkProjectsIntegrity: () => Promise<void>;
}

export const useProjectStore = create<ProjectsState>()(
  persist(
    (set) => ({
      projects: [],
      currentProjectPath: "",
      setCurrentProjectPath: (path) => set({ currentProjectPath: path }),
      addProject: (project) =>
        set((state) => ({ projects: [...state.projects, project] })),
      removeProject: async (folderPath, deleteFolder) => {
        if (deleteFolder) {
          await remove(folderPath, { recursive: true });
        }
        set((state) => ({
          projects: state.projects.filter((p) => p.folderPath !== folderPath),
        }));
      },
      updateProject: (folderPath, updatedData) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.folderPath === folderPath ? { ...p, ...updatedData } : p,
          ),
        })),
      checkProjectsIntegrity: async () => {
        const { projects } = useProjectStore.getState();
        const results = await Promise.all(
          projects.map(async (project) => {
            try {
              const fileName = `${project.name}.hlz`;
              const filePath = await join(project.folderPath, fileName);
              const fileExists = await exists(filePath);
              if (!fileExists) {
                return null;
              }
              const fileStat = await stat(filePath);
              const mtime = fileStat.mtime
                ? new Date(fileStat.mtime)
                : project.modifiedDate;
              return { ...project, modifiedDate: mtime };
            } catch (error) {
              console.error(
                `Error checking project integrity for ${project.folderPath}:`,
                error,
              );
              return null;
            }
          }),
        );
        const validProjects = results.filter((p): p is Project => p !== null);
        set({ projects: validProjects });
      }
    }),
    {
      name: "project-storage",
    },
  ),
);
