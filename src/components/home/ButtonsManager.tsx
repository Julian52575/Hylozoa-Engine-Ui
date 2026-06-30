import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

function ButtonAction({
  icon,
  label,
  onClick,
  variant = "default",
}: {
  icon: string;
  label: string;
  onClick?: () => void;
  variant?: "default" | "destructive";
}) {
  return (
    <Button
      className="w-full relative flex items-center justify-center cursor-pointer"
      variant={variant}
      onClick={onClick}
    >
      <Icon icon={icon} className="absolute left-3 scale-75" />
      <span>{label}</span>
    </Button>
  );
}

function DeleteProjectDialog({
  onConfirm,
}: {
  onConfirm: (removeFolder: boolean) => void;
}) {
  const [removeFolder, setRemoveFolder] = useState(false);
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm(removeFolder);
    setOpen(false);
    toast.success("Project removed successfully!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ButtonAction
          icon="fa6-solid:trash"
          label="Remove"
          variant="destructive"
        />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Are you sure?
            </DialogTitle>
          <DialogDescription>
            This action will remove the selected project. This action cannot be undone.
            <div className="flex flex-row justify-start items-center mt-2 gap-2 w-max">
              <Input type="checkbox" className="size-4 cursor-pointer" id="remove-folder" checked={removeFolder} onChange={(e) => setRemoveFolder(e.target.checked)} />
              <Label className="cursor-pointer" htmlFor="remove-folder">
                Remove the folder of the project
              </Label>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ButtonsContainer({
  onEditProject,
  onPlayProject,
  // onRenameProject,
  onRemoveProject,
}: {
  onEditProject?: () => void;
  onPlayProject?: () => void;
  onRenameProject?: () => void;
  onRemoveProject?: (deleteFolder: boolean) => void;
}) {
  return (
    <div className="flex-[0.15] border-l border-zinc-200 flex flex-col p-2 gap-2">
      <ButtonAction icon="fa6-solid:pen" label="Edit" onClick={onEditProject} />
      <ButtonAction icon="fa6-solid:play" label="Run" onClick={onPlayProject} />
      {/* <ButtonAction
        icon="fa6-solid:pen-to-square"
        label="Rename"
        onClick={onRenameProject}
      /> */}
      <DeleteProjectDialog onConfirm={onRemoveProject!} />
    </div>
  );
}
