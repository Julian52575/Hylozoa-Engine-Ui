import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider"

interface NumberOptionProps {
    label: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    onChange?: (newValue: number) => void;
}

export function NumberOption({ 
    label,
    value,
    onChange,
    min,
    max,
    step,
}: NumberOptionProps) {
    const [localValue, setLocalValue] = useState<string>(value.toString());

    useEffect(() => {
        setLocalValue(value.toString());
    }, [value]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const parsed = parseFloat(localValue);
            if (!isNaN(parsed) && parsed !== value) {
                onChange?.(parsed);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [localValue]);

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        const parsed = parseFloat(newValue);
        if (isNaN(parsed)) {
            setLocalValue(newValue);
            return;
        }
        if (min !== undefined && parsed < min) {
            setLocalValue(min.toString());
            onChange?.(min);
            return;
        }
        if (max !== undefined && parsed > max) {
            setLocalValue(max.toString());
            onChange?.(max);
            return;
        }
        setLocalValue(e.target.value);
    };

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
                value={localValue}
                onChange={handleOnChange}
                onBlur={handleOnChange}
                min={min}
                max={max}
                step={step}
                id={label} 
                className="h-8 text-sm font-mono border-zinc-200 focus-visible:border-zinc-400 focus-visible:ring-zinc-400/30 transition-all bg-white"
            />
            {min !== undefined && max !== undefined && (
                <Slider
                    value={[localValue ? parseFloat(localValue) : 0]}
                    onValueChange={(values) => {
                        const newValue = values[0];
                        setLocalValue(newValue.toString());
                        onChange?.(newValue);
                    }}
                    min={min}
                    max={max}
                    step={step}
                />
            )}
        </div>
    );
}