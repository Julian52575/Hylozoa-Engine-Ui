import { HeaderWindow } from "@/components/HeaderWindow";
import { useNavigate } from "react-router-dom";
import { Home } from "@/components/home";


export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="h-svh w-svw flex flex-col">
      <HeaderWindow isHome />
      <Home
        onEditProject={() => {navigate("/editor")}}
      />
    </div>
  )
}