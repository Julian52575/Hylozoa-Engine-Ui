import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function LinkedButton() {
  const [linkedActive, setLinkedActive] = useState(true);
  const toggleLink = () => setLinkedActive(!linkedActive);

  return (
    <Button
      onClick={toggleLink}
      size={"icon-xs"}
      variant={"ghost"}
      className="p-1 hover:bg-zinc-200 rounded-md transition-colors cursor-pointer"
      title={linkedActive ? "Unlink axes" : "Link axes"}
    >
      {linkedActive ? (
        <Icon icon="lucide:link" className="w-4 h-4" />
      ) : (
        <Icon icon="lucide:link-2-off" className="w-4 h-4" />
      )}
    </Button>
  );
}

function AxisInput({
  axisLabel,
  value,
  colorClass,
  onChange,
  onCommit,
}: {
  axisLabel: string;
  value: number;
  colorClass: string;
  onChange: (val: number) => void; // Simplifié : juste le nombre
  onCommit: (val: number) => void; // Simplifié : juste le nombre
}) {
  const safeValue = typeof value === "number" ? value : 0;
  const [localValue, setLocalValue] = useState<string>(safeValue.toString());
  const stateRef = useRef({ localValue, value, axisLabel });

  useEffect(() => {
    if (value !== null && value !== undefined) {
      setLocalValue(value.toString());
    }
  }, [value]);

  useEffect(() => {
    stateRef.current = { localValue, value, axisLabel };
  }, [localValue, value, axisLabel]);

  const processChange = (newValue: string) => {
    setLocalValue(newValue);
    const parsed = parseFloat(newValue);
    if (!isNaN(parsed)) {
      onChange?.(parsed);
    }
  };

  const handleBlur = (newValue: string) => {
    const parsed = parseFloat(newValue);
    if (!isNaN(parsed)) {
      onCommit?.(parsed);
    }
  };

  useEffect(() => {
    return () => {
      const { localValue } = stateRef.current;
      const parsed = parseFloat(localValue);
      if (!isNaN(parsed)) {
        onCommit?.(parsed);
      }
    };
  }, []);

  return (
    <div className="relative flex items-center group ">
      <Label
        className={`absolute left-2 inset-y-0 flex items-center text-sm font-semibold ${colorClass} select-none group-focus-within:${`${colorClass}/70`} mb-0.5`}
      >
        {axisLabel}
      </Label>
      <Input
        type="number"
        value={localValue}
        onChange={(e) => processChange(e.target.value)}
        onBlur={() => handleBlur(localValue)}
        className={`pl-6 h-8 text-sm font-mono border-zinc-200 focus-visible:border-${colorClass.split("-")[1]}-400 focus-visible:ring-${colorClass.split("-")[1]}-400/30 transition-all bg-white`}
      />
    </div>
  );
}

export function Vector2Option({
  label,
  x,
  y,
  linked,
  onChange,
  onCommit,
}: {
  label: string;
  x: number;
  y: number;
  linked: boolean;
  onChange?: (newVal: { x: number; y: number }) => void;
  onCommit?: (newVal: { x: number; y: number }) => void;
}) {
  const currentValues = useRef({ x, y });
  useEffect(() => {
    currentValues.current = { x, y };
  }, [x, y]);

  return (
    <div className="flex flex-col gap-2 p-3 bg-zinc-50/50 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-all cursor-default">
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-semibold text-zinc-500">{label}</span>
        {linked && <LinkedButton />}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <AxisInput
          axisLabel="X"
          value={x}
          colorClass="text-red-500"
          onChange={(newX) => onChange?.({ x: newX, y : currentValues.current.y })}
          onCommit={(finalX) => onCommit?.({ x: finalX, y: currentValues.current.y })}
        />
        <AxisInput
          axisLabel="Y"
          value={y}
          colorClass="text-green-500"
          onChange={(newY) => onChange?.({ x: currentValues.current.x, y: newY })}
          onCommit={(finalY) => onCommit?.({ x: currentValues.current.x, y: finalY })}
        />
      </div>
    </div>
  );
}
