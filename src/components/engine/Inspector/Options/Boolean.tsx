import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";


export function BooleanOption({ label, checked, onChange }: { label: string, checked: boolean, onChange: (value: boolean) => void }) {
    return (
        <div className="flex items-center justify-between p-3 bg-zinc-50/50 rounded-lg border border-zinc-200 transition-all hover:border-zinc-300">
            <Label 
                htmlFor={label} 
                className="text-sm font-semibold text-zinc-500 cursor-pointer select-none"
            >
                {label}
            </Label>

            <Switch 
                defaultChecked={checked} 
                id={label} 
                onCheckedChange={(value) => onChange(value)}
                className="data-[state=unchecked]:bg-zinc-300 scale-90 cursor-pointer transition-all"
            />
        </div>
    );
}