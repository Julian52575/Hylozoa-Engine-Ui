import Select, { StylesConfig } from "react-select";
import { Label } from "@/components/ui/label";

type OptionType = { label: string; value: any };

const reactSelectStyles: StylesConfig<OptionType, true> = {
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),

  control: (base, state) => ({
    ...base,
    backgroundColor: "white",
    borderColor: state.isFocused ? "rgb(161 161 170)" : "rgb(228 228 231)",
    borderRadius: "calc(var(--radius) - 2px)",
    boxShadow: state.isFocused ? "0 0 0 1px rgb(161 161 170)" : "none",
    minHeight: "32px",
    fontSize: "0.875rem",
    fontWeight: "500",
    transition: "all 0.2s",
    "&:hover": {
      borderColor: "rgb(212 212 216)",
    },
  }),

  valueContainer: (base) => ({
    ...base,
    padding: "2px 8px",
    gap: "4px",
  }),

  multiValue: (base) => ({
    ...base,
    backgroundColor: "rgb(244 244 245)",
    borderRadius: "calc(var(--radius) - 4px)",
    border: "1px solid rgb(228 228 231)",
    margin: "0",
  }),

  multiValueLabel: (base) => ({
    ...base,
    color: "rgb(63 63 70)",
    fontSize: "0.75rem",
    padding: "1px 4px",
  }),

  multiValueRemove: (base) => ({
    ...base,
    color: "rgb(113 113 122)",
    borderRadius: "0 calc(var(--radius) - 4px) calc(var(--radius) - 4px) 0",
    "&:hover": {
      backgroundColor: "rgb(254 226 226)",
      color: "rgb(220 38 38)",
    },
  }),

  menu: (base) => ({
    ...base,
    backgroundColor: "white",
    border: "1px solid rgb(228 228 231)",
    borderRadius: "calc(var(--radius) - 2px)",
    boxShadow:
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    fontSize: "0.875rem",
    overflow: "hidden",
  }),

  menuList: (base) => ({
    ...base,
    padding: "4px",
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "rgb(244 244 245)"
      : state.isFocused
        ? "rgb(250 250 250)"
        : "transparent",
    color: state.isSelected ? "rgb(39 39 42)" : "rgb(63 63 70)",
    borderRadius: "calc(var(--radius) - 4px)",
    padding: "6px 8px",
    cursor: "pointer",
    "&:active": {
      backgroundColor: "rgb(244 244 245)",
    },
  }),

  placeholder: (base) => ({
    ...base,
    color: "rgb(161 161 170)",
    fontSize: "0.875rem",
  }),

  input: (base) => ({
    ...base,
    color: "rgb(39 39 42)",
    fontSize: "0.875rem",
    margin: "0",
    padding: "0",
  }),

  indicatorSeparator: () => ({
    display: "none",
  }),

  dropdownIndicator: (base) => ({
    ...base,
    color: "rgb(161 161 170)",
    padding: "0 6px",
    "&:hover": {
      color: "rgb(113 113 122)",
    },
  }),

  clearIndicator: () => ({
    display: "none",
  }),
};

export function ArrayOption({
  label,
  options,
  values = [],
  min = 0,
  onChange,
}: {
  label: string;
  options: OptionType[];
  values?: any[];
  min?: number;
  onChange?: (newValues: any[]) => void;
}) {
  const selected = options.filter((opt) =>
    (values ?? []).some((v) => JSON.stringify(v) === JSON.stringify(opt.value)),
  );

  const handleChange = (selected: readonly OptionType[]) => {
    if (selected.length < min) return;
    onChange?.(Array.from(selected).map((s) => s.value));
  };

  const isBelowMin = selected.length <= min;

  return (
    <div className="flex flex-col gap-2 p-3 bg-zinc-50/50 rounded-lg border border-zinc-200">
      <Label
        htmlFor={label}
        className="text-sm font-semibold text-zinc-500 cursor-pointer select-none"
      >
        {label}
      </Label>
      <Select
        isMulti
        options={options}
        value={selected}
        onChange={(val) => handleChange(val as OptionType[])}
        getOptionValue={(opt: OptionType) => JSON.stringify(opt.value)}
        classNamePrefix="rs"
        menuPortalTarget={document.body}
        menuPosition="fixed"
        placeholder="Select options..."
        isClearable={!isBelowMin}
        styles={reactSelectStyles}
        components={
          isBelowMin
            ? {
                MultiValueRemove: () => null,
              }
            : undefined
        }
      />
    </div>
  );
}
