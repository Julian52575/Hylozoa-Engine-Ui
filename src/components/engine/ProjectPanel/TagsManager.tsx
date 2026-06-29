import { useEngineStore } from "@/store/engineStore";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

function TagItem({
  tag,
  forbiddenTags,
  onRemove,
  onRename,
}: {
  tag: string;
  forbiddenTags?: string[];
  onRemove: () => void;
  onRename: (newTag: string) => void;
}) {

  const [cpyName, setCopyName] = useState(tag);
  const [isRenaming, setIsRenaming] = useState(false);

  const handleRename = () => {
    if (cpyName.trim() === "" || cpyName.trim() === tag || forbiddenTags?.includes(cpyName.trim())) {
      setCopyName(tag);
      setIsRenaming(false);
      return;
    }
    setIsRenaming(false);
    onRename(cpyName.trim());
  };

  useEffect(() => {
    setCopyName(tag);
  }, [tag]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild onContextMenu={(e) => e.stopPropagation()}>
        <div
          onDoubleClick={() => setIsRenaming(true)}
          className={`px-4 py-2 bg-primary/5 rounded-md w-full flex items-center gap-2 
        `}
        >
          {isRenaming ? (
            <form onSubmit={handleRename}>
              <input
                autoFocus
                value={cpyName}
                onChange={(e) => setCopyName(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onBlur={handleRename}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsRenaming(false);
                    setCopyName(tag);
                  }
                }}
                className="w-full bg-transparent border-b border-primary focus:outline-none"
              />
            </form>
          ) : (
            <span className="select-none text-ellipsis whitespace-nowrap overflow-hidden">
              {cpyName}
            </span>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="p-1 w-56">
        <div className="flex flex-col text-sm">
          <ContextMenuItem
            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              document.dispatchEvent(
                new KeyboardEvent("keydown", { key: "Escape" }),
              );
              setTimeout(() => {
                setIsRenaming(true);
              }, 0);
            }}
          >
            <Icon icon="lucide:edit" className="w-4 h-4 shrink-0" />
            <span>Rename</span>
          </ContextMenuItem>
          <ContextMenuItem className={`flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer`} onClick={(e) => {
            e.preventDefault();
            onRemove();
          }}>
            <Icon icon="lucide:trash-2" className="w-4 h-4 shrink-0" />
            <span>Delete</span>
          </ContextMenuItem>
        </div>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function TagsManager() {
  const tags = useEngineStore((state) => state.tags);
  const addTag = useEngineStore((state) => state.addTag);
  const removeTag = useEngineStore((state) => state.removeTag);
  const renameTag = useEngineStore((state) => state.renameTag);

  return (
    <div className="flex-1 h-full flex flex-col items-start">
      <ContextMenu>
        <ContextMenuTrigger asChild onContextMenu={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-1.5 w-full p-2 overflow-auto h-full">
            {tags.length === 0 && (
              <div className="text-muted-foreground text-sm select-none">
                Right click to add a tag
              </div>
            )}
            {tags.map((tag) => (
              <TagItem
                key={tag}
                forbiddenTags={tags.filter((t) => t !== tag)}
                tag={tag}
                onRemove={() => removeTag(tag)}
                onRename={(newTag) => renameTag(tag, newTag)}
              />
            ))}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <div className="p-0.5 flex flex-col gap-1">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => addTag(`Tag ${tags.length + 1}`)}
            >
              Add Tag
            </Button>
          </div>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}