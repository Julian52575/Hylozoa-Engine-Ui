import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function NumberOption({ label, value }: { label: string, value: number }) {
    return (
        <div className="flex flex-col gap-2 p-3 bg-zinc-50/50 rounded-lg border border-zinc-200 transition-all hover:border-zinc-300">
            <Label 
                htmlFor={label}
                className="text-sm font-semibold text-zinc-500 cursor-pointer px-1"
            >
                {label}
            </Label>
            <Input 
                type="number" 
                defaultValue={value} 
                id={label} 
                className="h-8 text-sm font-mono border-zinc-200 focus-visible:border-zinc-400 focus-visible:ring-zinc-400/30 transition-all bg-white"
            />
        </div>
    );
}