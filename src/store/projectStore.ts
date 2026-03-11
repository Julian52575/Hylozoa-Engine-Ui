import { create } from "zustand";
import { persist } from "zustand/middleware";

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
    addProject: (project: Project) => void;
    removeProject: (folderPath: string) => void;
    updateProject: (folderPath: string, updatedData: Partial<Project>) => void;
}

export const useProjectStore = create<ProjectsState>()(
    persist(
        (set) => ({
            projects: [],
            addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
            removeProject: (folderPath) => set((state) => ({ projects: state.projects.filter((p) => p.folderPath !== folderPath) })),
            updateProject: (folderPath, updatedData) => set((state) => ({
                projects: state.projects.map((p) => p.folderPath === folderPath ? { ...p, ...updatedData } : p)
            }))
        }),
        {
            name: "project-storage",
        }
    )
);