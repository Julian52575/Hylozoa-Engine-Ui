import { SceneManager } from "@/components/engine/ProjectPanel/SceneManager";
import { PrefabsManager } from "@/components/engine/ProjectPanel/PrefabsManager";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { TagsManager } from "@/components/engine/ProjectPanel/TagsManager";
import { LayersManager } from "./LayersManager";


export function ProjectPanel() {
  return (
    <Tabs className="h-full" defaultValue="scenes">
        <TabsList className="w-full h-full">
            <TabsTrigger value="scenes"  className="w-1/4">
                Scenes
            </TabsTrigger>
            <TabsTrigger value="prefabs" className="w-1/4">
                Prefabs
            </TabsTrigger>
            <TabsTrigger value="tags" className="w-1/4">
                Tags
            </TabsTrigger>
            <TabsTrigger value="Layers" className="w-1/4">
                Layers
            </TabsTrigger>
        </TabsList>
        <TabsContent value="scenes" className="h-full">
            <SceneManager />
        </TabsContent>
        <TabsContent value="prefabs" className="h-full">
            <PrefabsManager />
        </TabsContent>
        <TabsContent value="tags" className="h-full">
            <TagsManager />
        </TabsContent>
        <TabsContent value="Layers" className="h-full">
            <LayersManager />
        </TabsContent>
    </Tabs>
  );
}