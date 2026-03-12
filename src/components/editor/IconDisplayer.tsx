import { FaRegCircle, FaCube } from 'react-icons/fa';
import { BsCameraVideoFill } from "react-icons/bs";
import { MdLightMode } from "react-icons/md";
import { MdOutlineRectangle } from "react-icons/md";



export default function IconDisplayer({ type,size = 12 } : { type: string, size?: number }) {
    const displayIcon = () => {
        switch(type) {
            case "camera":
                return <BsCameraVideoFill size={size} />;
            case "light":
                return <MdLightMode size={size} />;
            case "Rectangle":
                return <MdOutlineRectangle size={size} />;
            case "Circle":
                return <FaRegCircle size={size} />;
            default:
                return <FaCube size={size} />;
        }
    }

    return displayIcon();
}