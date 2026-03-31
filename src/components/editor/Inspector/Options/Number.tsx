import { Label } from "@/components/ui/label";
import { useEffect, useState, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { NumberInput } from "@/components/ui/number-input";

interface NumberOptionProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (newValue: number) => void;
  onCommit?: (newValue: number) => void;
}

export function NumberOption({
  label,
  value,
  min,
  max,
  step,
  onChange,
  onCommit,
}: NumberOptionProps) {
  const safeValue = typeof value === "number" ? value : 0;
  const [localValue, setLocalValue] = useState<number>(safeValue);
  const lastValueRef = useRef(localValue);

  useEffect(() => {
    if (typeof value === "number") {
      setLocalValue(value);
    }
  }, [value]);

  useEffect(() => {
    lastValueRef.current = localValue;
  }, [localValue]);

  const clamp = (val: number) => {
    let clamped = val;
    if (min !== undefined) clamped = Math.max(min, clamped);
    if (max !== undefined) clamped = Math.min(max, clamped);
    return clamped;
  };

  const processChange = (newValue: undefined | number) => {
    if (newValue === undefined) return;
    setLocalValue(newValue);
    const finalValue = clamp(newValue);
    onChange?.(finalValue);
  };

  const handleBlur = (newValue: undefined | number) => {
    if (newValue === undefined) return;
    const finalValue = clamp(newValue);
    onCommit?.(finalValue);
  };

  useEffect(() => {
    return () => {
      handleBlur(lastValueRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 p-3 bg-zinc-50/50 rounded-lg border border-zinc-200 transition-all hover:border-zinc-300">
      <Label
        htmlFor={label}
        className="text-sm font-semibold text-zinc-500 cursor-pointer px-1"
      >
        {label}
      </Label>
        <NumberInput
          id={label}
          value={localValue}
          thousandSeparator=","
          onValueChange={processChange}
          onBlur={handleBlur}
          min={min}
          max={max}
          step={step}
          showSpinButtons={false}
          decimalScale={2}
          className="w-full bg-white border-zinc-200 focus:ring-1 focus:ring-zinc-400 focus:ring-offset-0 transition-all font-medium text-sm"
        />
      {min !== undefined && max !== undefined && (
        <Slider
          value={[localValue]}
          onValueChange={(values) => processChange(values[0])}
          onBlur={() => handleBlur(localValue)}
          min={min}
          max={max}
          step={step}
        />
      )}
    </div>
  );
}
