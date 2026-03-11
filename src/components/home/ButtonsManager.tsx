import { Button } from "@/components/ui/button";
import { FaPen, FaPlay, FaTrash } from "react-icons/fa6";
import { LuTextCursor } from "react-icons/lu";


function ButtonAction({
    icon: Icon,
    label,
    onClick,
    variant = "default",
} : {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    onClick?: () => void;
    variant?: "default" | "destructive";
}){
    return (
        <Button className="w-full relative flex items-center justify-center cursor-pointer" variant={variant} onClick={onClick}>
            <Icon className="absolute left-3 scale-75" />
            <span>{label}</span>
        </Button>
    );
}


export default function ButtonsContainer({
    onEditProject,
    onRemoveProject,
} : {
    onEditProject?: () => void;
    onRemoveProject?: () => void;
}) {
    return (
        <div className="flex-[0.15] border-l border-zinc-200 flex flex-col p-2 gap-2">
            <ButtonAction
                icon={FaPen}
                label="Edit"
                onClick={onEditProject}
            />
            <ButtonAction
                icon={FaPlay}
                label="Run"
            />
            <ButtonAction
                icon={LuTextCursor}
                label="Rename"
            />
            <ButtonAction
                icon={FaTrash}
                label="Remove"
                variant="destructive"
                onClick={onRemoveProject}
            />
        </div>
    );
}
