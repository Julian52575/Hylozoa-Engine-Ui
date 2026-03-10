

export function ConsoleDisplayer() {
    const messages = [
        { text: "Console Output:", type: "info" },
        { text: "Initializing application...", type: "info" },
        { text: "> Loading modules...", type: "info" },
        { text: "> Application started successfully.", type: "success" },
        { text: "Warning: Low memory detected.", type: "warning" },
        { text: "Error: Failed to load resource.", type: "error" },
        { text: "Tip: Use 'help' command to list available commands.", type: "info" },
        { text: "> help", type: "info" },
        { text: "Available commands: start, stop, restart, status", type: "info" },
        { text: "> status", type: "info" },
        { text: "Application is running smoothly.", type: "success" },
    ]

    const handleTypeClass = (type: string) => {
        switch(type) {            
            case "success":
                return "text-green-400";
            case "warning":
                return "text-yellow-400";
            case "error":
                return "text-red-400";
            case "info":
            default:
                return "text-zinc-300";
        }
    }


    return (
        <div className="w-full h-full bg-primary p-2 overflow-auto 
            [&::-webkit-scrollbar]:w-1
            [&::-webkit-scrollbar-track]:bg-zinc-900/20
            [&::-webkit-scrollbar-thumb]:bg-zinc-500
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-zinc-400"
        >
            {messages.map((message, index) => (
                <div key={index} className={handleTypeClass(message.type) + " font-mono text-sm mb-1"}>
                    {message.text}
                </div>
            ))}
        </div>
    )
}