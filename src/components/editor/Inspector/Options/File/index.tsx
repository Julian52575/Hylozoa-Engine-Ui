import { ImageAccept } from "./ImageAccept";


interface FileOptionProps {
    label: string;
    value: string;
    accept?: "image" | "video" | "audio";
    onCommit: (newValue: any) => void;
}

export function FileOption({ 
    label, 
    value,
    accept,
    onCommit,
}: FileOptionProps) {
    if (accept === "image") {
        return (
            <ImageAccept label={label} value={value} onChange={onCommit} />
        );
    }
    return (
        <div className="flex flex-col gap-2 p-3 bg-zinc-50/50 rounded-lg border border-zinc-200 transition-all hover:border-zinc-300">
            <div className="px-1">
                This file type is not supported yet. Please select an image file.
            </div>
        </div>
     );
}
