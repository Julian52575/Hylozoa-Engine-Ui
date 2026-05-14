import { Label } from "@/components/ui/label";
import { forwardRef, useEffect, useState } from "react";
import { HexColorPicker, RgbaColorPicker } from "react-colorful";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { type VariantProps } from "class-variance-authority";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface ColorPickerProps {
  value: string | RGBA;
  onChange?: (value: string | RGBA) => void;
  onBlur?: (value: string | RGBA) => void;
}

interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const colorToCss = (color: string | RGBA) => {
  if (typeof color === "string") return color;
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
};

const ColorPicker = forwardRef<
  HTMLInputElement,
  Omit<ButtonProps, "value" | "onChange" | "onBlur"> &
    ColorPickerProps &
    VariantProps<typeof buttonVariants>
>(
  (
    { disabled, value, onChange, onBlur, name, className, size, ...props },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [localValue, setLocalValue] = useState<string | RGBA>(
      value || "#FFFFFF",
    );

    useEffect(() => {
      if (value) {
        setLocalValue(value);
      }
    }, [value]);

    const isRgba = typeof localValue === "object" && localValue !== null;

    const handleColorChange = (newColor: string | RGBA) => {
      setLocalValue(newColor);
      onChange?.(newColor);
    };

    const handleOpenChange = (newOpen: boolean) => {
      setOpen(newOpen);
      if (!newOpen) {
        onBlur?.(localValue);
      }
    };

    return (
      <Popover onOpenChange={handleOpenChange} open={open}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            {...props}
            className={cn("block", className)}
            name={name}
            onClick={() => {
              setOpen(true);
            }}
            size={size}
            style={{
              backgroundColor: colorToCss(localValue),
            }}
            variant="outline"
          >
            <div />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit flex flex-col items-center p-2">
          {isRgba ? (
            <RgbaColorPicker color={localValue} onChange={handleColorChange} />
          ) : (
            <HexColorPicker color={localValue} onChange={handleColorChange} />
          )}
          {!isRgba && (
            <InputGroup className="mt-2">
              <InputGroupInput
                placeholder="Hex color code"
                maxLength={6}
                onChange={(e) => {
                  const val = e.currentTarget.value;
                  handleColorChange(val.startsWith("#") ? val : `#${val}`);
                }}
                onBlur={() => onBlur?.(localValue)}
                className="h-8 font-mono text-xs uppercase"
                ref={ref}
                value={localValue.replace("#", "")}
              />
              <InputGroupAddon className="text-muted-foreground font-mono text-xs">
                #
              </InputGroupAddon>
            </InputGroup>
          )}
          {isRgba && (
            <div className="grid grid-cols-4 gap-1 text-[10px] font-mono uppercase text-center w-full mt-3">
              {(["r", "g", "b", "a"] as const).map((key) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-[9px] text-muted-foreground">
                    {key}
                  </label>
                  <input
                    type="number"
                    min={key === "a" ? 0 : 0}
                    max={key === "a" ? 1 : 255}
                    step={key === "a" ? 0.01 : 1}
                    value={localValue[key]}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      const clampedVal =
                        key === "a"
                          ? Math.min(1, Math.max(0, val))
                          : Math.min(255, Math.max(0, Math.round(val)));

                      handleColorChange({
                        ...localValue,
                        [key]: clampedVal,
                      });
                    }}
                    className="w-full bg-muted border-none rounded p-1 text-center focus:ring-1 focus:ring-ring outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  },
);

export function ColorOption({
  label,
  value,
  onChange,
  onCommit,
}: {
  label: string;
  value: string | RGBA;
  onChange?: (value: string | RGBA) => void;
  onCommit?: (value: string | RGBA) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-zinc-50/50 rounded-lg border border-zinc-200 transition-all hover:border-zinc-300 ">
      <Label
        className="text-sm font-semibold text-zinc-500 cursor-pointer"
        htmlFor={label}
      >
        {label}
      </Label>
      <ColorPicker
        id={label}
        value={value}
        onChange={onChange}
        onBlur={onCommit}
      />
    </div>
  );
}
