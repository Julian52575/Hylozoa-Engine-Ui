import GraphComponent from "@/components/layout/Graph";
import { HeaderWindow } from "@/components/layout/HeaderWindow";

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