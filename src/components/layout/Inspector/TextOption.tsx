import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function TextOption({ label, value }: { label: string, value: string }) {
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

            <Textarea 
                defaultValue={value} 
                id={label} 
                className="bg-white border-zinc-200 focus-visible:ring-zinc-400/30 text-sm min-h-[110px] resize-none leading-relaxed placeholder:text-zinc-400"
                placeholder={`Enter ${label.toLowerCase()}...`}
            />
        </div>
    );
}
