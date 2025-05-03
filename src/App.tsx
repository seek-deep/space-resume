import GalaxyScene from "./components/GalaxyScene";
import HUDOverlay from "./components/HUDOverlay";
import "./index.css";

function App() {
  return (
    <div className="!w-screen !h-screen bg-black overflow-hidden m-0">
      <HUDOverlay />
      <GalaxyScene />
    </div>
  );
}

export default App;
