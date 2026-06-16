import { HeaderWindow } from "@/components/HeaderWindow";
import { useNavigate } from "react-router-dom";
import { Home } from "@/components/home";
import { useEffect } from "react";
import { useSchemaStore } from "@/store/useSchemaStore";


export default function HomePage() {
  const navigate = useNavigate();
  const loadSchemas = useSchemaStore((s) => s.loadSchemas);
  
    useEffect(() => {
      loadSchemas();
    }, [loadSchemas]);
  return (
    <div className="h-svh w-svw flex flex-col">
      <HeaderWindow isHome />
      <Home
        onEditProject={() => {navigate("/engine")}}
      />
    </div>
  )
}