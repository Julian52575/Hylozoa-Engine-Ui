import { Vector2Option } from "./Options/Vector2";
import { EnumOption } from "./Options/Enum";
import { BooleanOption } from "./Options/Boolean";
import { TextOption } from "./Options/Text";
import { NumberOption } from "./Options/Number";
import { FileOption } from "./Options/File";
import { ColorOption } from "./Options/Color";

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
  const { type, label, options, dependency, min, max, step, accept } =
    propConfig;

  if (dependency && allValues) {
    const [depKey, depValue] = dependency.split("-");
    if (allValues[depKey] !== depValue) {
      return null;
    }
  }

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
          options={options || []}
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
    default:
      return <div className="font-semibold">Unsupported type: {type}</div>;
  }
}
