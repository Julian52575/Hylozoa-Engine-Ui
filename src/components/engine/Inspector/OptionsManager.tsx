import { Vector2Option } from "./Options/Vector2";
import { EnumOption } from "./Options/Enum";
import { BooleanOption } from "./Options/Boolean";
import { TextOption } from "./Options/Text";
import { NumberOption } from "./Options/Number";
import { FileOption } from "./Options/File";
import { ColorOption } from "./Options/Color";
import { ArrayOption } from "./Options/Array";
import { useEngineStore } from "@/store/engineStore";

interface OptionsManagerProps {
  propConfig: Record<string, any>;
  value: any;
  allValues: Record<string, any>;
  onValueChange: (newValue: any) => void;
  onCommit: (newValue: any) => void;
}

export default function OptionsManager({
  propConfig,
  value,
  allValues,
  onValueChange,
  onCommit,
}: OptionsManagerProps) {
  const layers = useEngineStore((s) => s.layers);
  const { type, label, options, optionsSource, dependency, min, max, step, accept } =
    propConfig;

  if (dependency && allValues) {
    const [depKey, depValue] = dependency.split("-");
    if (allValues[depKey] !== depValue) {
      return null;
    }
  }

  const resolvedOptions = optionsSource === "layers" ? layers.map((l) => ({ label: l, value: l })) : options;

  switch (type) {
    case "vector2":
      return (
        <Vector2Option
          label={label}
          x={value.x}
          y={value.y}
          linked={true}
          onChange={onValueChange}
          onCommit={onCommit}
        />
      );
    case "enum":
      return (
        <EnumOption
          label={label}
          options={resolvedOptions}
          value={value}
          onChange={onCommit}
        />
      );
    case "boolean":
      return (
        <BooleanOption label={label} checked={value} onChange={onCommit} />
      );
    case "text":
      return <TextOption label={label} value={value} />;
    case "number":
      return (
        <NumberOption
          label={label}
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={onValueChange}
          onCommit={onCommit}
        />
      );
    case "file":
      return (
        <FileOption
          label={label}
          value={value}
          accept={accept}
          onCommit={onCommit}
        />
      );
    case "color":
      return (
        <ColorOption
          label={label}
          value={value}
          onChange={onValueChange}
          onCommit={onCommit}
        />
      );
    case "array":
      return (
        <ArrayOption
          label={label}
          options={resolvedOptions}
          values={value}
          min={min}
          onChange={onCommit}
        />
      );
    default:
      return <div className="font-semibold">Unsupported type: {type}</div>;
  }
}
