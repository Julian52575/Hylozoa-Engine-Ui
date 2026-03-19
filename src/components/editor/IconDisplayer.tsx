import { FaRegCircle, FaCube } from "react-icons/fa";
import { PiVideoCameraFill } from "react-icons/pi";
import { MdLightMode } from "react-icons/md";
import { MdOutlineRectangle } from "react-icons/md";
import { TbCube } from "react-icons/tb";

export default function IconDisplayer({
  type,
  size = 12,
}: {
  type: string;
  size?: number;
}) {
  const displayIcon = () => {
    switch (type) {
      case "camera":
        return <PiVideoCameraFill size={size} />;
      case "light":
        return <MdLightMode size={size} />;
      case "Rectangle":
        return <MdOutlineRectangle size={size} />;
      case "Circle":
        return <FaRegCircle size={size} />;
      case "entity":
        return <TbCube size={size} />;
      default:
        return <FaCube size={size} />;
    }
  };

  return displayIcon();
}
