import { useEffect, useRef } from "react";

export default function HUDOverlay({ onNavigate }: any) {
  const planets = [
    "About Me",
    "Experience",
    "Projects",
    "Skills",
    "Contact",
    "Hobbies",
    "Education",
  ];

  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      window.removeEventListener("click", playAudio); // Remove listener after first interaction
    };

    window.addEventListener("click", playAudio); // Start audio on user interaction
    return () => {
      audio.pause();
      window.removeEventListener("click", playAudio);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full bg-black bg-opacity-70 p-4 text-white z-10 flex justify-between items-center">
      {planets.map((planet) => (
        <button
          key={planet}
          className="mx-2 px-4 py-2 bg-gray-800 rounded hover:bg-gray-600"
          onClick={() => onNavigate(planet)}
        >
          {planet}
        </button>
      ))}
    </div>
  );
}
