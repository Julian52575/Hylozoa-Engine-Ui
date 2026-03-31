import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EnumOption({ 
    label, 
    options, 
    value,
    onChange
}: { 
    label: string, 
    options: string[], 
    value: string,
    onChange?: (newValue: string) => void
}) {
    return (
        <div className="flex flex-col gap-2 p-3 bg-zinc-50/50 rounded-lg border border-zinc-200 transition-all hover:border-zinc-300">
            <Label 
                htmlFor={label} 
                className="text-sm font-semibold text-zinc-500 cursor-pointer px-1"
            >
                {label}
            </Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger 
                    id={label} 
                    className="w-full h-8 text-sm bg-white border-zinc-200 focus:ring-1 focus:ring-zinc-400 focus:ring-offset-0 transition-all font-medium"
                >
                    <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                
                <SelectContent 
                    side="bottom"
                    align="start"
                    position="popper" 
                    sideOffset={-5}
                    className="border-zinc-200 shadow-lg"
                >
                    {options.map((option) => (
                        <SelectItem 
                            key={option} 
                            value={option}
                            className="text-sm focus:bg-zinc-100 focus:text-zinc-900 cursor-pointer"
                        >
                            {option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}