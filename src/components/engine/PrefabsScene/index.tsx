import { Displayer } from "@/components/engine/MainScene";
import { useEngineStore } from "@/store/engineStore";
import { useEffect, useRef, useState } from "react";

export function PrefabsScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;


    const { width, height } = container.getBoundingClientRect();
    if (width > 0 && height > 0) {setDimensions({ width, height });
      setDimensions({ width, height });
      return;
    }
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      if (rect.width === 0 || rect.height === 0) return;
      setDimensions({ width: rect.width, height: rect.height });
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const prefabs = useEngineStore((state) => state.prefabs);
  const prefabsArray = Object.values(prefabs);


  return (
    <div className="flex-1 w-full h-full min-h-0" ref={containerRef}>
      <Displayer
        width={dimensions.width}
        height={dimensions.height}
        entities={prefabsArray}
        fromPrefabs={true}
      />
    </div>
  );
}
