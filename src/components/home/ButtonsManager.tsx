import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";

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

export default function ButtonsContainer({
  onEditProject,
  onPlayProject,
  onRenameProject,
  onRemoveProject,
}: {
  onEditProject?: () => void;
  onPlayProject?: () => void;
  onRenameProject?: () => void;
  onRemoveProject?: () => void;
}) {
  return (
    <div className="flex-[0.15] border-l border-zinc-200 flex flex-col p-2 gap-2">
      <ButtonAction icon="fa6-solid:pen" label="Edit" onClick={onEditProject} />
      <ButtonAction icon="fa6-solid:play" label="Run" onClick={onPlayProject} />
      <ButtonAction
        icon="fa6-solid:pen-to-square"
        label="Rename"
        onClick={onRenameProject}
      />
      <ButtonAction
        icon="fa6-solid:trash"
        label="Remove"
        variant="destructive"
        onClick={onRemoveProject}
      />
    </div>
  );
}
