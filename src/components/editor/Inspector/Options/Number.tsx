import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";

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

  const safeValue = typeof value === 'number' ? value : 0;
  const [localValue, setLocalValue] = useState<string>(safeValue.toString());
  useEffect(() => {
    if (typeof value === 'number') {
      setLocalValue(value.toString());
    }
  }, [value]);

  const processChange = (newValue: string | number) => {
    const strValue = newValue.toString();
    setLocalValue(strValue);
    
    if (newValue === "" || newValue === "-") return;

    const parsed = parseFloat(newValue as string);
    if (!isNaN(parsed) && parsed !== value) {
      let finalValue = parsed;
      if (min !== undefined && parsed < min) finalValue = Math.max(min, finalValue);
      if (max !== undefined && parsed > max) finalValue = Math.min(max, finalValue);
      onChange?.(finalValue);
    }
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
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          processChange(e.target.value)
        }
        onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
          processChange(e.target.value)
        }
        min={min}
        max={max}
        step={step}
        id={label}
        className="h-8 text-sm font-mono border-zinc-200 focus-visible:border-zinc-400 focus-visible:ring-zinc-400/30 transition-all bg-white"
      />
      {min !== undefined && max !== undefined && (
        <Slider
          value={[localValue ? parseFloat(localValue) : 0]}
          onValueChange={(values) => processChange(values[0])}
          onBlur={() => processChange(localValue)}
          min={min}
          max={max}
          step={step}
        />
      )}
    </div>
  );
}
