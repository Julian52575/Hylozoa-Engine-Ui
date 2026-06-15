// ProjectPanel.tsx
import { useState } from "react";
import { SceneManager } from "@/components/engine/SceneManager";
import { PrefabsManager } from "@/components/engine/PrefabsManager";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

type Tab = "scenes" | "prefabs";

export function ProjectPanel() {
  const [activeTab, setActiveTab] = useState<Tab>("scenes");

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Tab)} className="h-full">
        <TabsList className="w-full h-full">
            <TabsTrigger value="scenes" className="w-1/2">
                Scenes
            </TabsTrigger>
            <TabsTrigger value="prefabs" className="w-1/2">
                Prefabs
            </TabsTrigger>
        </TabsList>
        <TabsContent value="scenes" className="h-full">
            <SceneManager />
        </TabsContent>
        <TabsContent value="prefabs" className="h-full">
            <PrefabsManager />
        </TabsContent>
    </Tabs>
  );
}