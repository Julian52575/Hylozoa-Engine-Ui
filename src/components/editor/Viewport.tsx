import { Button } from "../ui/button";
import { Icon } from "@iconify/react";

export function ViewportButtons() {
    return (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <div className="flex items-center justify-start flex-1 pl-4">
                <Button variant="outline" size={"icon-sm"}>
                    <Icon icon="lucide:mouse-pointer" className="w-4 h-4 ml-0.5" />
                </Button>
                <Button variant="outline" size={"icon-sm"}>
                    <Icon icon="lucide:move" className="w-4 h-4" />
                </Button>
                <Button variant="outline" size={"icon-sm"}>
                   <Icon icon="lucide:rotate-cw" className="w-4 h-4" />
                </Button>
                <Button variant="outline" size={"icon-sm"}>
                    <Icon icon="lucide:maximize-2" className="w-4 h-4 rotate-45" />
                </Button>
            </div>
        </div>
    );
}