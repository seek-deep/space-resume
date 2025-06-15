import { useState } from "react";
import GalaxyScene from "./components/GalaxyScene";
import HUDOverlay from "./components/HUDOverlay";
import "./index.css";

interface NavigationItem {
  name: string;
  type: "planet" | "moon";
  description?: string;
}

function App() {
  const [selectedItem, setSelectedItem] = useState<NavigationItem | null>(null);

  const handleNavigate = (item: NavigationItem) => {
    setSelectedItem(item);
  };

  return (
    <div className="!w-screen !h-screen bg-black overflow-hidden m-0">
      <HUDOverlay onNavigate={handleNavigate} />
      <GalaxyScene selectedItem={selectedItem} />
    </div>
  );
}

export default App;
