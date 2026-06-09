import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

import { useSchemaStore } from "@/store/useSchemaStore"
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Icon } from "@iconify/react";

export default function ComponentModal({
    onValidate,
    componentsDisallowed = [],
} : {
    onValidate?: (componentType: string) => void;
    componentsDisallowed?: string[];
}) {
    const baseSchemas = useSchemaStore((s) => s.schemas);
    const schemas = Object.values(baseSchemas).filter(s => !componentsDisallowed.includes(s.type));
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const handleAddComponent = () => {
        if (onValidate && selected) {
            onValidate(selected);
        }
        setOpen(false);
    }

    const handleClose = () => {
        setOpen(false);
        setSelected(null);
        setSearch("");
    }

    const filteredSchemas = Object.values(schemas).filter((schema) =>
        schema.label.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"ghost"} className="cursor-pointer">
            Add Component
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new Component</DialogTitle>
        </DialogHeader>
        <div>
            <Input 
                placeholder="Search Component..." 
                className="mb-4" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                autoFocus
                onKeyDown={(e) => e.stopPropagation()}
            />
            <div className="flex flex-col overflow-scroll gap-2 max-h-[300px]">
                {filteredSchemas.map((schema) => (
                    <div 
                        key={schema.type} 
                        className={`
                            p-2 border-b cursor-pointer rounded hover:bg-primary/10 flex items-center
                            ${selected === schema.type ? "bg-primary/20" : ""}
                        `}
                        onClick={() => setSelected(schema.type)}
                        onDoubleClick={handleAddComponent}
                    >
                        <Icon icon={schema.icon} className="w-4 h-4 mr-2" />
                        <span>{schema.label}</span>
                    </div>
                ))}
            </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <div className="w-full flex items-center justify-center gap-2">
                <Button className="border p-2 rounded cursor-pointer" variant={"outline"} onClick={handleClose}>
                    Close
                </Button>
                <Button className="border p-2 rounded cursor-pointer" onClick={handleAddComponent} disabled={!selected}>
                    Add
                </Button>
            </div>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}