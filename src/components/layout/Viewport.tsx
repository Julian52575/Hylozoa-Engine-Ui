import { Button } from "../ui/button";
import { FaMousePointer } from "react-icons/fa";
import { RiDragMoveFill } from "react-icons/ri";
import { TbRotateDot } from "react-icons/tb";
import { IoMdResize } from "react-icons/io";

export function Viewport() {
    return (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <div className="flex items-center justify-start flex-1 pl-4">
                <Button variant="outline" size={"icon-sm"}>
                    <FaMousePointer className="ml-0.5" />
                </Button>
                <Button variant="outline" size={"icon-sm"}>
                    <RiDragMoveFill />
                </Button>
                <Button variant="outline" size={"icon-sm"}>
                    <TbRotateDot className="rotate-90"/>
                </Button>
                <Button variant="outline" size={"icon-sm"}>
                    <IoMdResize />
                </Button>
            </div>
        </div>
    );
}