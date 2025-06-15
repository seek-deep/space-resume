import { useEffect, useRef, useState } from "react";
import { orbits } from "../constants";

export default function HUDOverlay({ onNavigate }: any) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null);

  useEffect(() => {
    const audio = new Audio(
      "/audios/Interstellar Main Theme - Extra Extended - Soundtrack by  Hans Zimmer.mp3"
    );
    audio.loop = true;
    audioRef.current = audio;

    const playAudio = () => {
      audio.play().catch((err) => {
        console.error("Audio playback failed:", err);
      });
      window.removeEventListener("click", playAudio);
    };

    window.addEventListener("click", playAudio);
    return () => {
      audio.pause();
      window.removeEventListener("click", playAudio);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full bg-black bg-opacity-70 p-4 text-white z-10 flex justify-between items-start">
      {orbits.map((planet) => (
        <div key={planet.name} className="relative">
          <button
            className="mx-2 px-4 py-2 bg-gray-800 rounded hover:bg-gray-600"
            onClick={() => {
              onNavigate({ name: planet.name, type: "planet" });
              setExpandedPlanet(
                expandedPlanet === planet.name ? null : planet.name
              );
            }}
          >
            {planet.name}
          </button>

          {expandedPlanet === planet.name &&
            planet.moons &&
            planet.moons.length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded shadow-lg">
                {planet.moons.map((moon) => (
                  <button
                    key={moon.name}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-600"
                    onClick={() => {
                      onNavigate({
                        name: moon.name,
                        type: "moon",
                        description: moon.description,
                      });
                      setExpandedPlanet(null);
                    }}
                  >
                    {moon.name}
                  </button>
                ))}
              </div>
            )}
        </div>
      ))}
    </div>
  );
}
