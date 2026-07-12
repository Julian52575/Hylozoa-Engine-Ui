
import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import  { Label } from "@/components/ui/label";


import ImportButton from "./ImportButton";
import CreateButton from "./CreateButton";



export default function Header({searchTerm, setSearchTerm, sortOption, setSortOption}: {searchTerm: string, setSearchTerm: (value: string) => void, sortOption: string, setSortOption: (value: string) => void }) {
    return (
        <div className="w-full flex items-center justify-center gap-1.5 p-2 bg-secondary border-b border-zinc-200">
            <CreateButton />
            <ImportButton />
            <Input 
                placeholder="Search" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex items-center gap-1">
                <Label className="text-sm" htmlFor="sort-select">
                    Sort:
                </Label>
                <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger id="sort-select" className="w-[150px] bg-white border-zinc-200 focus:ring-1 focus:ring-zinc-400 focus:ring-offset-0 transition-all font-medium h-8 text-sm">
                        <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent 
                        position="popper" 
                        sideOffset={-5}
                        className="w-full"
                    >
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="path">Path</SelectItem>
                        <SelectItem value="favorite">Favorite</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
