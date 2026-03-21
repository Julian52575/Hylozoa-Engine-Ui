import { Button } from "../ui/button";
import { FaPlay } from "react-icons/fa";
import { FaStop } from "react-icons/fa";
import { FaPause } from "react-icons/fa";

export function Toolbar() {
    return (
        <div className="w-full h-12 bg-primary/10 flex items-center px-2 gap-2 justify-center border-b border-primary/20">
            <Button variant="outline" className="cursor-pointer">
                <FaPlay className="ml-0.5" />
                <span>Play</span>
            </Button>
            <Button variant="outline" className="cursor-pointer">
                <FaPause />
                <span>Pause</span>
            </Button>
            <Button variant="outline" className="cursor-pointer">
                <FaStop />
                <span>Stop</span>
            </Button>
        </div>
    );
}