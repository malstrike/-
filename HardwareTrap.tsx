import React, { useEffect, useRef, useState } from 'react';
import { Camera, Mic, AlertTriangle } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

const HardwareTrap: React.FC<Props> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [micActive, setMicActive] = useState(false);
  const [camActive, setCamActive] = useState(false);
  const [bypassMode, setBypassMode] = useState(false);

  const requestCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCamActive(true);
      }
    } catch (e) {
      console.warn("Camera access denied or failed", e);
      // Simulate forced hacking bypass
      setBypassMode(true);
      setTimeout(() => {
          setCamActive(true);
      }, 1500);
    }
  };

  const requestMic = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicActive(true);
    } catch (e) {
      console.warn("Mic access denied or failed", e);
      // Simulate forced bypass
      setTimeout(() => {
        setMicActive(true);
      }, 1000);
    }
  };

  useEffect(() => {
    if (micActive && camActive) {
      setTimeout(onComplete, 2000);
    }
  }, [micActive, camActive, onComplete]);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8">
      <div className="bg-slate-800 border-2 border-red-600 w-full max-w-lg p-6 rounded shadow-[0_0_50px_rgba(255,0,0,0.5)]">
        <div className="flex items-center gap-3 text-red-500 mb-6 border-b border-red-500/30 pb-4">
          <AlertTriangle size={32} />
          <h2 className="text-2xl font-bold font-mono">СБОЙ ЦЕЛОСТНОСТИ СИСТЕМЫ</h2>
        </div>
        
        <p className="text-slate-300 mb-8 font-mono leading-relaxed">
          КРИТИЧЕСКАЯ ОШИБКА 0x882. НЕСТАБИЛЬНОСТЬ РЕСУРСОВ.
          <br/>
          ТРЕБУЕТСЯ РУЧНОЕ ПЕРЕОПРЕДЕЛЕНИЕ ОБОРУДОВАНИЯ ДЛЯ ПРЕДОТВРАЩЕНИЯ ПОТЕРИ ДАННЫХ.
        </p>

        {bypassMode && (
            <div className="mb-4 text-red-500 font-mono animate-pulse border border-red-500 p-2 text-sm">
                ВНИМАНИЕ: ОТКАЗ В ДОСТУПЕ. ИНИЦИИРОВАН ПРОТОКОЛ ОБХОДА БЕЗОПАСНОСТИ...
            </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded">
            <div className="flex items-center gap-3 text-white">
              <Mic size={24} className={micActive ? "text-green-500" : "text-gray-400"} />
              <span>Аудиовход (Микрофон)</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={micActive} onChange={() => !micActive && requestMic()} />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between bg-slate-900 p-4 rounded">
            <div className="flex items-center gap-3 text-white">
              <Camera size={24} className={camActive ? "text-green-500" : "text-gray-400"} />
              <span>Видеосенсор (Камера)</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={camActive} onChange={() => !camActive && requestCam()} />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
        </div>

        {camActive && (
           <div className="mt-6 border border-red-500/50 relative h-32 w-full bg-black overflow-hidden">
               <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover opacity-50 grayscale contrast-150 brightness-50 ${bypassMode ? 'hidden' : 'block'}`} 
               />
               <div className="absolute inset-0 pointer-events-none bg-[url('https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif')] opacity-20 mix-blend-overlay bg-repeat"></div>
               {/* Fallback Static for bypass mode */}
               {bypassMode && (
                   <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif')] opacity-40 mix-blend-screen"></div>
               )}
           </div>
        )}
      </div>
    </div>
  );
};

export default HardwareTrap;