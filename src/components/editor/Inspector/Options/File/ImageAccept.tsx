import { Label } from "@/components/ui/label";
import { ImageIcon, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { open } from '@tauri-apps/plugin-dialog';
import { useState, useEffect } from "react";
import { convertFileSrc } from '@tauri-apps/api/core';

function ImageInput({ 
    image : initialImage,
    text,
    onImageChange
}: { 
    image?: string,
    text?: string,
    onImageChange?: (image: string) => void
}) {
    const [localImage, setLocalImage] = useState<string | undefined>(initialImage);

    useEffect(() => {
        setLocalImage(initialImage);
    }, [initialImage]);

    const loadImage = async () => {
        const selected = await open({
            multiple: false,
            title: "Choisir une image",
            filters: [
                { name: "Images", extensions: ["jpg", "jpeg", "png", "gif", "svg"] }
            ]
        });
        if (selected && typeof selected === "string") {
            setLocalImage(selected);
            if (onImageChange) 
                onImageChange(selected);
        }
    };

    return (
        <Button 
            variant="outline" 
            onClick={loadImage}
            className="relative h-14 w-full flex items-center justify-start gap-4 px-3 hover:bg-accent transition-all group hover:cursor-pointer"
        >
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md ">
                {localImage ? (
                    <img 
                        src={localImage.startsWith('http') ? localImage : convertFileSrc(localImage)}
                        alt="Image preview" 
                        className="h-full w-full object-contain transition-transform" 
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center border bg-muted">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                )}
            </div>
            <div className="flex flex-col items-start gap-0.5 overflow-hidden">
                <span className="text-sm font-medium leading-none">{text}</span>
                <span className="text-xs text-muted-foreground truncate">
                    {localImage ? "Changer l'image" : "Aucune image sélectionnée"}
                </span>
            </div>
            <FolderOpen className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </Button>
    )
}

export function ImageAccept({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col gap-2 p-3 bg-zinc-50/50 rounded-lg border border-zinc-200 transition-all hover:border-zinc-300">
            <div className="px-1">
                <Label 
                    htmlFor={label} 
                    className="text-sm font-semibold text-zinc-500 cursor-pointer"
                >
                    {label}
                </Label>
            </div>

            <ImageInput 
                image={value} 
                text={label}
                onImageChange={(newImage) => {
                    console.log("Selected image:", newImage);
                }} 
            />
        </div>
    );
}
