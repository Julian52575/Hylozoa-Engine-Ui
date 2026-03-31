import { Label } from "@/components/ui/label";
import { forwardRef, useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
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

interface ColorPickerProps {
  value: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const ColorPicker = forwardRef<
  HTMLInputElement,
  Omit<ButtonProps, "value" | "onChange" | "onBlur"> &
    ColorPickerProps &
    ButtonProps
>(
  (
    { disabled, value, onChange, onBlur, name, className, size, ...props },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [localValue, setLocalValue] = useState<string>(value || "#FFFFFF");

    useEffect(() => {
      if (value) {
        setLocalValue(value);
      }
    }, [value]);

    const handleColorChange = (newColor: string) => {
      setLocalValue(newColor);
      onChange?.(newColor);
    };

    return (
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild disabled={disabled} onBlur={onBlur}>
          <Button
            {...props}
            className={cn("block", className)}
            name={name}
            onClick={() => {
              setOpen(true);
            }}
            size={size}
            style={{
              backgroundColor: localValue,
            }}
            variant="outline"
          >
            <div />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit flex flex-col items-center p-2">
          <HexColorPicker color={localValue} onChange={handleColorChange} />
          <InputGroup className="mt-2">
            <InputGroupInput
              placeholder="Hex color code"
              maxLength={6}
              onChange={(e) => {
                const val = e.currentTarget.value;
                handleColorChange(val.startsWith("#") ? val : `#${val}`);
              }}
              className="h-8 font-mono text-xs uppercase"
              ref={ref}
              value={localValue.replace("#", "")}
            />
            <InputGroupAddon className="text-muted-foreground font-mono text-xs">
              #
            </InputGroupAddon>
          </InputGroup>
        </PopoverContent>
      </Popover>
    );
  },
);

export function ColorOption({
  label,
  value,
}: {
  label: string;
  value: string;
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
      />
    </div>
  );
}
