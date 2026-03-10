import GraphComponent from "@/components/graph";
import { HeaderWindow } from "@/components/HeaderWindow";

export default function GraphPage() {
    return (
        <main className="h-screen w-full flex flex-col">
            <HeaderWindow isHome/>
            <div className="w-full h-full">
                <GraphComponent />
            </div>
        </main>
    )
}