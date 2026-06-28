import { SceneManager } from "@/components/engine/ProjectPanel/SceneManager";
import { PrefabsManager } from "@/components/engine/ProjectPanel/PrefabsManager";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { TagsManager } from "@/components/engine/ProjectPanel/TagsManager";


export function ProjectPanel() {
  return (
    <Tabs className="h-full">
        <TabsList className="w-full h-full">
            <TabsTrigger value="scenes" className="w-1/3">
                Scenes
            </TabsTrigger>
            <TabsTrigger value="prefabs" className="w-1/3">
                Prefabs
            </TabsTrigger>
            <TabsTrigger value="tags" className="w-1/3">
                Tags
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
    </Tabs>
  );
}