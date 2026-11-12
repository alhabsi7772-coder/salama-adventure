import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { GameProvider } from "@/game/store";
import { audio } from "@/game/audio";
import HomeScreen from "@/screens/HomeScreen";
import IntroScreen from "@/screens/IntroScreen";
import MapScreen from "@/screens/MapScreen";
import LevelScreen from "@/screens/LevelScreen";
import ResultsScreen from "@/screens/ResultsScreen";
import CertificateScreen from "@/screens/CertificateScreen";

function App() {
  useEffect(() => {
    const u = () => audio.unlock();
    window.addEventListener("pointerdown", u);
    window.addEventListener("keydown", u);
    return () => { window.removeEventListener("pointerdown", u); window.removeEventListener("keydown", u); };
  }, []);
  return (
    <div className="App" dir="rtl">
      <GameProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/intro" element={<IntroScreen />} />
            <Route path="/map" element={<MapScreen />} />
            <Route path="/level/:id" element={<LevelScreen />} />
            <Route path="/results" element={<ResultsScreen />} />
            <Route path="/certificate" element={<CertificateScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-center" richColors dir="rtl" />
      </GameProvider>
    </div>
  );
}

export default App;
