import { HeaderWindow } from "@/components/HeaderWindow";
import { useNavigate } from "react-router-dom";
import { Home } from "@/components/home";
import { useEffect } from "react";
import { useSchemaStore } from "@/store/useSchemaStore";
import { useProjectStore } from "@/store/projectStore";


export default function HomePage() {
  const navigate = useNavigate();
  const loadSchemas = useSchemaStore((s) => s.loadSchemas);
  const checkProjectsIntegrity = useProjectStore((s) => s.checkProjectsIntegrity);
  
    useEffect(() => {
      loadSchemas();
    }, [loadSchemas]);

  useEffect(() => {
    checkProjectsIntegrity();
  }, [checkProjectsIntegrity]);

  return (
    <div className="h-svh w-svw flex flex-col">
      <HeaderWindow isHome />
      <Home
        onEditProject={() => {navigate("/engine")}}
      />
    </div>
  )
}