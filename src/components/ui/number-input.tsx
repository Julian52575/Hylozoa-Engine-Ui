import { Icon } from "@iconify/react";
import { forwardRef, useCallback, useEffect, useState, useRef } from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface NumberInputProps extends Omit<
  NumericFormatProps,
  "value" | "onValueChange" | "onBlur"
> {
  step?: number;
  thousandSeparator?: string;
  placeholder?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  value?: number;
  suffix?: string;
  prefix?: string;
  onValueChange?: (value: number | undefined) => void;
  onBlur?: (value: number | undefined) => void;
  fixedDecimalScale?: boolean;
  decimalScale?: number;
  showSpinButtons?: boolean;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      step,
      thousandSeparator,
      placeholder,
      defaultValue,
      min = -Infinity,
      max = Infinity,
      onValueChange,
      onBlur,
      fixedDecimalScale = false,
      decimalScale = 0,
      suffix,
      prefix,
      value: controlledValue,
      showSpinButtons = true,
      ...props
    },
    ref,
  ) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const combinedRef = ref || internalRef;
    const [value, setValue] = useState<number | undefined>(
      controlledValue ?? defaultValue,
    );

    const handleIncrement = useCallback(() => {
      setValue((prev) =>
        prev === undefined ? (step ?? 1) : Math.min(prev + (step ?? 1), max),
      );
    }, [step, max]);

    const handleDecrement = useCallback(() => {
      setValue((prev) =>
        prev === undefined ? -(step ?? 1) : Math.max(prev - (step ?? 1), min),
      );
    }, [step, min]);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          document.activeElement ===
          (combinedRef as React.RefObject<HTMLInputElement>).current
        ) {
          if (e.key === "ArrowUp") {
            handleIncrement();
          } else if (e.key === "ArrowDown") {
            handleDecrement();
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [handleIncrement, handleDecrement, combinedRef]);

    useEffect(() => {
      if (controlledValue !== undefined) {
        setValue(controlledValue);
      }
    }, [controlledValue]);

    const clamp = (val: number) => {
      let clamped = val;
      if (min !== undefined) clamped = Math.max(min, clamped);
      if (max !== undefined) clamped = Math.min(max, clamped);
      return clamped;
    };

    const handleChange = (values: {
      value: string;
      floatValue: number | undefined;
    }) => {
      const rawValue = values.floatValue;
      if (rawValue === undefined) {
        setValue(undefined);
        onValueChange?.(undefined);
        return;
      }
      const clampedValue = clamp(rawValue);
      if (clampedValue === value && rawValue !== clampedValue) {
        setValue(undefined);
        setTimeout(() => {
          setValue(clampedValue);
        }, 0);
        return;
      }
      if (rawValue !== clampedValue) {
        setValue(clampedValue);
        onValueChange?.(clampedValue);
      } else {
        setValue(rawValue);
        onValueChange?.(rawValue);
      }
    };

    const handleBlur = () => {
      if (value !== undefined) {
        let newValue = clamp(value);
        setValue(newValue);
        onBlur?.(newValue);
      }
    };

    return (
      <div className="group relative flex items-center w-full">
        <NumericFormat
          value={value}
          onValueChange={handleChange}
          thousandSeparator={thousandSeparator}
          decimalScale={decimalScale}
          fixedDecimalScale={fixedDecimalScale}
          allowNegative={min < 0}
          valueIsNumericString
          onBlur={handleBlur}
          max={max}
          min={min}
          suffix={suffix}
          prefix={prefix}
          customInput={Input}
          placeholder={placeholder}
          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full pr-8"
          getInputRef={combinedRef}
          {...props}
        />
        {showSpinButtons && (
          <div className="absolute right-1 inset-y-1.5 flex flex-col w-7 overflow-hidden border border-zinc-200 bg-white scale-70">
            <Button
              type="button"
              variant="ghost"
              size={"icon-xs"}
              aria-label="Increase value"
              className="h-1/2 w-full px-0 rounded-none hover:bg-zinc-100 border-b-[0.5px] border-input transition-colors"
              onClick={handleIncrement}
              disabled={value !== undefined && value >= max}
            >
              <Icon icon="mynaui:chevron-up-solid" width="24" height="24" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size={"icon-xs"}
              aria-label="Decrease value"
              className="h-1/2 w-full px-0 rounded-none rounded-br-md hover:bg-zinc-100 transition-colors"
              onClick={handleDecrement}
              disabled={value !== undefined && value <= min}
            >
              <Icon icon="mynaui:chevron-down-solid" width="24" height="24" />
            </Button>
          </div>
        )}
      </div>
    );
  },
);
