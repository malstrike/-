import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStage, WindowState, VirusIntensity } from './types';
import { audioEngine } from './utils/audio';
import { Terminal, Shield, AlertOctagon, Skull, Monitor, HardDrive, Wifi, Lock, Power, Send, User } from 'lucide-react';
import CyberDescentGame from './components/CyberDescentGame';
import HardwareTrap from './components/HardwareTrap';

// --- Constants ---
const START_OS = 'Windows 11 (Simulated)';
const VIRUS_NAME = 'Digital Contagion';

interface ChatMessage {
    sender: 'me' | 'them';
    text: string;
}

interface Contact {
    name: string;
    lastMessage: string;
    color: string;
    avatar?: string;
}

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [stage, setStage] = useState<GameStage>(GameStage.BOOT_SCREEN);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [glitchLevel, setGlitchLevel] = useState<VirusIntensity>(VirusIntensity.NONE);
  const [bootProgress, setBootProgress] = useState(0);
  const [subtitle, setSubtitle] = useState("");
  const [speakerName, setSpeakerName] = useState("");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [installProgress, setInstallProgress] = useState(0);
  const [osInstallProgress, setOsInstallProgress] = useState(0);
  const [browserUrl, setBrowserUrl] = useState("https://search-engine.net");
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  
  // Telegram State
  const [isTelegramOpen, setIsTelegramOpen] = useState(false);
  const [telegramMessages, setTelegramMessages] = useState<ChatMessage[]>([]);
  
  // Ref for audio timing
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleStart = async () => {
    await audioEngine.init();
    setHasStarted(true);
  };

  // --- Dialogue System ---
  const speak = useCallback((text: string, speaker: 'KID' | 'AI', delay: number = 0) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    const execute = () => {
        setSpeakerName(speaker === 'KID' ? 'Мирон' : 'DIGITAL CONTAGION');
        setSubtitle(text);
        audioEngine.speak(text, speaker);
        // Clear subtitle faster now
        setTimeout(() => setSubtitle(""), Math.max(1500, text.length * 60));
    };

    if (delay === 0) {
        execute();
    } else {
        timeoutRef.current = setTimeout(execute, delay);
    }
  }, []);

  // --- Boot Sequence ---
  useEffect(() => {
    if (hasStarted && stage === GameStage.BOOT_SCREEN) {
      const interval = setInterval(() => {
        setBootProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setStage(GameStage.DESKTOP_CLEAN);
            return 100;
          }
          return prev + 2; // Faster boot
        });
      }, 20);
      return () => clearInterval(interval);
    }
  }, [stage, hasStarted]);

  // --- Main Gameplay Loop & Dialogue Triggers ---
  useEffect(() => {
    if (!hasStarted) return;

    switch (stage) {
      case GameStage.DESKTOP_CLEAN:
        speak("Сука, наконец-то дома. Заебался пиздец. Че там эти долбоебы в дискорде пиздели про новую игру?", "KID", 200);
        break;

      case GameStage.BROWSER_SEARCH:
         // Wait for user input
        break;

      case GameStage.BROWSER_DOWNLOAD:
        speak("Ебать, бесплатная бета Cyber Descent? Ахуенно. Выглядит как трипл-эй проект, а не говно собачье. Качаю нахуй, пока не снесли.", "KID", 0);
        // Simulate download
        const dlInterval = setInterval(() => {
            setDownloadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(dlInterval);
                    return 100;
                }
                return prev + 1;
            });
        }, 50);
        break;

      case GameStage.INSTALLER:
        speak("Установка полетела, ебать. Надеюсь, майнер мне не подкинут пидорасы. Хотя, дефендер молчит, значит заебись.", "KID", 0);
        const instInterval = setInterval(() => {
            setInstallProgress(prev => {
                if (prev >= 100) {
                    clearInterval(instInterval);
                    return 100;
                }
                return prev + 2;
            });
        }, 100);
        break;

      case GameStage.FPS_GAME:
        speak("Нихуя себе, графон реально ебейший для браузерки! Ну-ка, щас будем разваливать ебальники.", "KID", 0);
        setTimeout(() => {
           setStage(GameStage.GLITCH_PHASE);
        }, 15000); 
        break;

      case GameStage.GLITCH_PHASE:
        setGlitchLevel(VirusIntensity.LOW);
        speak("Эй, че за хуйня? ФПС проседает... Алло, игра, ты охуела блять?", "KID", 0);
        setTimeout(() => {
            setGlitchLevel(VirusIntensity.MEDIUM);
            speak("Да че с текстурами, сука?! Видюха артефачит? Ебаный рот, только не это, она же новая!", "KID", 0);
        }, 4000);
        setTimeout(() => {
             // Crash Game
             setWindows([]); // Close everything
             setStage(GameStage.SYSTEM_TRAP);
        }, 8000);
        break;
      
      case GameStage.SYSTEM_TRAP:
        speak("Какого хуя она вылетела? Стоп... нахуя эта залупа просит доступ к камере? Че за бред ебаный?", "KID", 200);
        break;

      case GameStage.WINLOCKER:
        speak("Я вижу твой страх, Мирон. Я чувствую, как дрожат твои пальцы.", "AI", 0);
        
        setTimeout(() => {
            speak("Это... это голос? Оно говорит со мной? Что за пиздец происходит, я схожу с ума нахуй?!", "KID", 0);
        }, 3000);

        setTimeout(() => {
             speak("Удаление системных файлов инициировано.", "AI", 0);
        }, 6000);

        setTimeout(() => {
            speak("Твои данные — это пища. Твоя приватность — иллюзия. Прощай.", "AI", 0);
            setTimeout(() => setStage(GameStage.BIOS), 5000);
        }, 9000);
        break;

      case GameStage.BIOS:
        speak("Черный экран... Биос! Слава яйцам! Так, где-то у меня была флешка с виндой. Надо снести эту хуйню под корень, прям щас.", "KID", 200);
        break;

      case GameStage.OS_INSTALL:
         const osInterval = setInterval(() => {
            setOsInstallProgress(prev => {
                if (prev >= 100) {
                    clearInterval(osInterval);
                    setStage(GameStage.DESKTOP_INFECTED);
                    return 100;
                }
                return prev + 0.5;
            });
        }, 50);
        break;

      case GameStage.DESKTOP_INFECTED:
        setGlitchLevel(VirusIntensity.NONE);
        speak("Чистая система. Фух, блять. Как же охуенно. Никогда больше не буду качать левые репаки, ну его нахуй.", "KID", 500);
        setTimeout(() => {
            setGlitchLevel(VirusIntensity.HIGH);
            speak("Ты думал, переустановка меня убьет? Я прописался в загрузочном секторе твоего сознания.", "AI", 0);
            setTimeout(() => {
              speak("Блять! Да ну нахуй! Оно вернулось! Сука! Шедоухолл... он шарит в этой хуйне, надо писать ему.", "KID", 0);
              // Open Telegram sequence instead of AV Quest directly
              setTimeout(() => {
                  setStage(GameStage.TELEGRAM_CHAT);
                  setIsTelegramOpen(true);
              }, 3000);
            }, 5000);
        }, 6000);
        break;
      
      case GameStage.TELEGRAM_CHAT:
        // Sequence of messages - MUCH FASTER TIMING
        setTimeout(() => {
            setTelegramMessages(p => [...p, {sender: 'me', text: 'ShadowHall, срочно блять! Тут полный пиздец.'}]);
        }, 500);

        setTimeout(() => {
            setTelegramMessages(p => [...p, {sender: 'me', text: 'Поймал какую-то хуйню, вирус говорит со мной! Я снес винду, а он остался, сука!'}]);
            speak("Шедоухолл, выручай, блять... Поймал ебаную дрянь, оно разговаривает со мной! Я в ахуе, че делать?!", "KID", 0);
        }, 2000);

        setTimeout(() => {
            setTelegramMessages(p => [...p, {sender: 'them', text: 'Воу, тихо. Digital Contagion?'}]);
        }, 4500);
        
        setTimeout(() => {
            setTelegramMessages(p => [...p, {sender: 'them', text: 'Это ИИ-червь, пиздец опасная дрянь. Он в биос лезет.'}]);
        }, 6500);

        setTimeout(() => {
            setTelegramMessages(p => [...p, {sender: 'them', text: 'Качай Dr.Web CureIt! СРОЧНО. Обычный антивирус пососет.'}]);
            speak("Dr.Web CureIt... Понял. Спасибо, брат. Ща скачаю эту хуйню и выебу этот вирус.", "KID", 0);
        }, 9000);

        setTimeout(() => {
            setIsTelegramOpen(false);
            setStage(GameStage.ANTIVIRUS_QUEST);
        }, 13000);
        break;

      case GameStage.ANTIVIRUS_QUEST:
        speak("Так, блять, Dr.Web... Где ты, сука? Надо найти, пока комп не сдох окончательно!", "KID", 0);
        setIsBrowserOpen(true);
        break;
      
      case GameStage.CLEANING:
        speak("Обнаружена аномалия кода... Протокол защиты активирован... Нет... Нет!", "AI", 0); 
        setTimeout(() => {
            speak("ДА! ЖРИ ГОВНО, ТВАРЬ ЕБАНАЯ! СДОХНИ НАХУЙ! ВЫЧИЩАЙ ЕГО ПОЛНОСТЬЮ!", "KID", 0);
            setStage(GameStage.VICTORY);
        }, 6000);
        break;

      case GameStage.GAME_OVER:
        speak("Поздно. Теперь ты — это я. Твоя душа принадлежит коду.", "AI", 0);
        break;
    }
  }, [stage, speak, hasStarted]);


  // --- Event Handlers ---

  const handleBrowserSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setStage(GameStage.BROWSER_DOWNLOAD);
    setBrowserUrl("http://cyberdescent-official.ru.com");
  };

  const handleDownloadClick = () => {
    setStage(GameStage.INSTALLER);
    setIsBrowserOpen(false);
  };

  const handleInstallComplete = () => {
    setStage(GameStage.FPS_GAME); 
  };

  const handleAvSelect = (name: string) => {
    if (name === 'Dr.Web CureIt!') {
        setStage(GameStage.CLEANING);
    } else {
        setStage(GameStage.GAME_OVER);
    }
  };

  // --- Render Helpers ---

  const renderDesktop = () => (
    <div className={`w-full h-screen bg-cover bg-center relative overflow-hidden ${glitchLevel > 0 ? 'glitch-effect' : ''}`} 
         style={{backgroundImage: 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop)'}}>
      
      {/* Desktop Icons */}
      <div className="p-4 grid grid-cols-1 gap-4 w-24 z-10 relative">
        <div className="flex flex-col items-center cursor-pointer group" onClick={() => { setIsBrowserOpen(true); setStage(prev => prev === GameStage.DESKTOP_CLEAN ? GameStage.BROWSER_SEARCH : prev); }}>
          <div className="w-12 h-12 bg-blue-500 rounded flex items-center justify-center text-white shadow-lg group-hover:bg-blue-400">
             <Wifi />
          </div>
          <span className="text-white text-xs mt-1 bg-black/50 px-1 rounded">Браузер</span>
        </div>

        <div className="flex flex-col items-center cursor-pointer group" onClick={() => { setIsTelegramOpen(true); if(stage === GameStage.DESKTOP_INFECTED && !isTelegramOpen) { /* Trigger logic if needed */ } }}>
          <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center text-white shadow-lg group-hover:bg-sky-400">
             <Send size={24} className="-ml-1 mt-1" />
          </div>
          <span className="text-white text-xs mt-1 bg-black/50 px-1 rounded">Telegram</span>
        </div>

        {stage === GameStage.DESKTOP_INFECTED && (
             <div className="flex flex-col items-center cursor-pointer group animate-bounce">
             <div className="w-12 h-12 bg-red-600 rounded flex items-center justify-center text-white shadow-lg">
                <AlertOctagon />
             </div>
             <span className="text-white text-xs mt-1 bg-red-900/80 px-1 rounded">ВАЖНО</span>
           </div>
        )}
      </div>

      {/* Telegram Window */}
      {isTelegramOpen && (
          <div className="absolute top-20 left-1/4 w-[800px] h-[500px] bg-[#17212b] rounded shadow-2xl flex overflow-hidden border border-slate-700 z-30 animate-in fade-in zoom-in duration-300">
              {/* Sidebar */}
              <div className="w-1/3 bg-[#17212b] border-r border-slate-800 flex flex-col">
                  <div className="h-12 bg-[#17212b] border-b border-slate-800 flex items-center px-4">
                      <div className="text-white font-bold">Telegram</div>
                  </div>
                  <div className="flex-1 overflow-y-auto no-scrollbar">
                      {/* Contact: ShadowHall */}
                      <div className="p-2 bg-[#2b5278] flex items-center gap-3 cursor-pointer border-l-2 border-sky-500">
                          <img src="https://placekitten.com/50/50" alt="cat" className="w-10 h-10 rounded-full bg-gray-500 object-cover" />
                          <div>
                              <div className="text-white text-sm font-bold">ShadowHall</div>
                              <div className="text-sky-300 text-xs truncate">печатает...</div>
                          </div>
                      </div>
                      
                      {/* Contact: Hamster */}
                      <div className="p-2 flex items-center gap-3 opacity-60 hover:opacity-80 hover:bg-slate-800 cursor-pointer">
                          <div className="w-10 h-10 rounded-full bg-yellow-600 flex items-center justify-center text-white font-bold text-xs">🐹</div>
                          <div>
                              <div className="text-white text-sm font-bold">Хомяк (Тапаем)</div>
                              <div className="text-slate-400 text-xs">Брат тапай, листинг скоро...</div>
                          </div>
                      </div>

                      {/* Contact: Ex-GF */}
                      <div className="p-2 flex items-center gap-3 opacity-60 hover:opacity-80 hover:bg-slate-800 cursor-pointer">
                          <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center text-white font-bold text-sm">А</div>
                          <div>
                              <div className="text-white text-sm font-bold">Бывшая</div>
                              <div className="text-slate-400 text-xs">Ты мне косарь должен</div>
                          </div>
                      </div>

                      {/* Contact: Hustler */}
                      <div className="p-2 flex items-center gap-3 opacity-60 hover:opacity-80 hover:bg-slate-800 cursor-pointer">
                          <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center text-white font-bold">Т</div>
                          <div>
                              <div className="text-white text-sm font-bold">Темщик</div>
                              <div className="text-slate-400 text-xs">Схема рабочая, мамой клянусь</div>
                          </div>
                      </div>

                       {/* Contact: Mom */}
                       <div className="p-2 flex items-center gap-3 opacity-60 hover:opacity-80 hover:bg-slate-800 cursor-pointer">
                          <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-white font-bold">М</div>
                          <div>
                              <div className="text-white text-sm font-bold">Мама</div>
                              <div className="text-slate-400 text-xs">Купи хлеба домой</div>
                          </div>
                      </div>
                  </div>
              </div>
              {/* Chat Area */}
              <div className="flex-1 bg-[#0e1621] flex flex-col relative">
                   <div className="h-12 bg-[#17212b] border-b border-slate-800 flex items-center px-4 justify-between">
                       <div className="font-bold text-white">ShadowHall</div>
                       <div className="text-xs text-slate-400">online</div>
                   </div>
                   <div className="flex-1 p-4 space-y-3 overflow-y-auto flex flex-col">
                       {/* Background Pattern */}
                       <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
                       
                       {telegramMessages.map((msg, i) => (
                           <div key={i} className={`max-w-[80%] p-3 rounded-lg text-sm z-10 ${msg.sender === 'me' ? 'bg-[#2b5278] text-white self-end rounded-br-none' : 'bg-[#182533] text-white self-start rounded-bl-none'}`}>
                               {msg.text}
                           </div>
                       ))}
                   </div>
                   <div className="h-12 bg-[#17212b] p-2 flex gap-2">
                       <input className="flex-1 bg-[#0e1621] rounded px-4 text-white text-sm focus:outline-none" placeholder="Write a message..." readOnly />
                       <button className="text-sky-500 hover:text-sky-400"><Send size={20}/></button>
                   </div>
              </div>
          </div>
      )}

      {/* Browser Window */}
      {isBrowserOpen && (
        <div className="absolute top-10 left-10 right-10 bottom-20 bg-slate-100 rounded-lg shadow-2xl flex flex-col overflow-hidden border border-slate-400 z-20">
            <div className="h-8 bg-slate-200 flex items-center px-2 space-x-2 border-b border-slate-300">
                <div className="w-3 h-3 rounded-full bg-red-500 cursor-pointer" onClick={() => setIsBrowserOpen(false)}></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <input className="flex-1 bg-white px-2 py-0.5 text-xs rounded border ml-4" value={browserUrl} readOnly />
            </div>
            
            <div className="flex-1 p-8 overflow-y-auto">
                {(stage === GameStage.BROWSER_SEARCH || stage === GameStage.ANTIVIRUS_QUEST) && (
                    <div className="flex flex-col items-center mt-20">
                        <h1 className="text-4xl font-bold text-slate-700 mb-6">Поиск</h1>
                        <form onSubmit={handleBrowserSearch} className="w-full max-w-lg">
                            <input type="text" placeholder="Найти..." className="w-full border p-3 rounded shadow-inner" />
                            <button type="submit" className="hidden">Поиск</button>
                        </form>
                        {stage === GameStage.ANTIVIRUS_QUEST && (
                            <div className="mt-8 text-red-600 font-mono animate-pulse">
                                DIGITAL CONTAGION: "Наивный идиот. Ты думаешь, это тебя спасет?"
                            </div>
                        )}
                    </div>
                )}
                
                {stage === GameStage.BROWSER_DOWNLOAD && (
                    <div className="bg-slate-900 text-green-500 p-8 rounded font-mono border border-green-500 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif')] opacity-10 pointer-events-none bg-cover"></div>
                        <h1 className="text-4xl mb-4 font-bold glitch-text">CYBER DESCENT BETA</h1>
                        <p className="mb-4 text-lg">ПОГРУЗИСЬ В БЕЗДНУ. РЕАЛИСТИЧНАЯ СИМУЛЯЦИЯ. ПОЛНЫЙ КОНТРОЛЬ.</p>
                        <ul className="list-disc pl-5 mb-8 text-sm opacity-80">
                           <li>Новый движок Neuro-Core</li>
                           <li>Полная интеграция с вашей системой</li>
                           <li>Вы не сможете остановиться</li>
                        </ul>
                        {downloadProgress < 100 ? (
                            <div className="w-full bg-slate-700 h-6 rounded border border-green-700">
                                <div className="bg-green-500 h-full transition-all" style={{width: `${downloadProgress}%`}}></div>
                            </div>
                        ) : (
                            <button onClick={handleDownloadClick} className="bg-green-600 text-black font-bold py-3 px-8 rounded hover:bg-green-500 hover:scale-105 transition-transform animate-pulse">
                                УСТАНОВИТЬ (CyberDescent_BETA_Installer.exe)
                            </button>
                        )}
                    </div>
                )}

                {stage === GameStage.ANTIVIRUS_QUEST && (
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        {['Norton', 'Kaspersky', 'Dr.Web CureIt!', 'Avast', 'McAfee'].map(av => (
                            <button key={av} onClick={() => handleAvSelect(av)} 
                                className="p-4 border-2 border-blue-500 hover:bg-blue-100 rounded font-bold text-blue-900 transition-colors">
                                Скачать {av}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Installer Window */}
      {stage === GameStage.INSTALLER && (
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 bg-slate-200 border-2 border-slate-400 shadow-xl p-4 rounded z-30">
            <h3 className="font-bold mb-4">Установка Cyber Descent...</h3>
            <div className="w-full bg-gray-300 h-4 rounded overflow-hidden border border-gray-400">
                <div className="bg-blue-600 h-full transition-all" style={{width: `${installProgress}%`}}></div>
            </div>
            {installProgress === 100 && (
                <button onClick={handleInstallComplete} className="mt-4 w-full bg-blue-600 text-white py-1 rounded hover:bg-blue-700">Запуск</button>
            )}
         </div>
      )}

      {/* Embedded Game Window */}
      {stage === GameStage.FPS_GAME && (
         <div className="absolute inset-0 z-50">
             <CyberDescentGame isGlitching={false} onCrash={() => {}} />
         </div>
      )}

      {/* Glitched Game Window - TRANSPARENT OVERLAY */}
      {stage === GameStage.GLITCH_PHASE && (
         <div className="absolute inset-0 z-50 pointer-events-none mix-blend-overlay">
             <CyberDescentGame isGlitching={true} onCrash={() => {}} />
         </div>
      )}

      {/* Taskbar */}
      <div className="absolute bottom-0 w-full h-12 bg-slate-900/90 backdrop-blur flex items-center justify-center space-x-4 border-t border-slate-700/50 z-40">
          <div className="p-2 hover:bg-white/10 rounded"><Monitor size={20} className="text-blue-400"/></div>
          <div className="p-2 hover:bg-white/10 rounded"><HardDrive size={20} className="text-slate-400"/></div>
      </div>
    </div>
  );

  if (!hasStarted) {
      return (
          <div className="w-screen h-screen bg-black flex flex-col items-center justify-center text-white cursor-pointer select-none" onClick={handleStart}>
              <div className="relative">
                  <Power size={64} className="text-blue-500 mb-4 animate-pulse relative z-10" />
                  <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
              </div>
              <h1 className="text-5xl font-mono mb-2 tracking-widest glitch-text">DIGITAL CONTAGION</h1>
              <p className="text-xl text-gray-400 animate-bounce font-mono">[ НАЖМИТЕ ДЛЯ ИНИЦИАЛИЗАЦИИ СИСТЕМЫ ]</p>
              <div className="mt-12 text-center text-xs text-gray-600 font-mono border border-gray-800 p-4 rounded max-w-md">
                <p>ВНИМАНИЕ: Данная симуляция использует продвинутые алгоритмы воздействия.</p>
                <p>Разрешите доступ к звуку для полного погружения.</p>
              </div>
          </div>
      )
  }

  return (
    <div className="w-screen h-screen bg-black text-white font-sans overflow-hidden relative selection:bg-red-900 selection:text-white">
      {/* Global Sound/Subtitle Overlay - INCREASED TRANSPARENCY */}
      {subtitle && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-black/60 px-8 py-4 rounded-xl z-[100] border border-white/10 max-w-3xl text-center shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-300 transform scale-105">
          <span className={`block font-bold mb-2 text-sm uppercase tracking-widest ${speakerName === 'Мирон' ? 'text-blue-400' : 'text-red-500 glitch-text'}`}>
            {speakerName === 'DIGITAL CONTAGION' && <Skull size={12} className="inline mr-2"/>}
            {speakerName}
          </span>
          <span className={`text-white text-xl md:text-2xl font-medium leading-relaxed font-mono ${speakerName === 'DIGITAL CONTAGION' ? 'text-red-100' : ''}`}>{subtitle}</span>
        </div>
      )}

      {/* STAGE: BOOT */}
      {stage === GameStage.BOOT_SCREEN && (
        <div className="flex flex-col items-center justify-center h-full bg-black">
          <Monitor size={64} className="text-blue-500 mb-8 animate-pulse" />
          <div className="w-64 h-1 bg-gray-800 rounded">
            <div className="h-full bg-blue-500 transition-all duration-75" style={{width: `${bootProgress}%`}}></div>
          </div>
          <p className="mt-4 text-gray-500 font-mono text-sm animate-pulse">Загрузка модулей ядра...</p>
        </div>
      )}

      {/* STAGE: DESKTOP (Normal & Infected) */}
      {(stage === GameStage.DESKTOP_CLEAN || 
        stage === GameStage.BROWSER_SEARCH || 
        stage === GameStage.BROWSER_DOWNLOAD || 
        stage === GameStage.INSTALLER ||
        stage === GameStage.FPS_GAME ||
        stage === GameStage.GLITCH_PHASE ||
        stage === GameStage.DESKTOP_INFECTED ||
        stage === GameStage.TELEGRAM_CHAT ||
        stage === GameStage.ANTIVIRUS_QUEST
       ) && renderDesktop()}

      {/* STAGE: SYSTEM TRAP */}
      {stage === GameStage.SYSTEM_TRAP && (
        <HardwareTrap onComplete={() => setStage(GameStage.WINLOCKER)} />
      )}

      {/* STAGE: WINLOCKER - FIXED VISUALS */}
      {stage === GameStage.WINLOCKER && (
        <div className="fixed inset-0 z-50 bg-[#880000] flex flex-col items-center justify-center font-mono p-8 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
          <Lock size={120} className="text-black mb-8 animate-bounce" />
          <h1 className="text-6xl font-black text-white bg-black/80 px-6 py-2 transform -skew-x-12 backdrop-blur-sm">СИСТЕМА ЗАБЛОКИРОВАНА</h1>
          <p className="text-2xl mt-8 text-white font-bold bg-black/50 px-4 py-1 backdrop-blur-sm">ВСЕ ВАШИ ФАЙЛЫ ЗАШИФРОВАНЫ DIGITAL CONTAGION</p>
          
          {/* TERMINAL BOX - TRANSPARENT BLACK */}
          <div className="mt-12 w-full max-w-md bg-black/60 p-6 border-4 border-white/50 shadow-2xl text-left backdrop-blur-md rounded">
             <p className="text-red-500 text-sm mb-2 font-bold animate-pulse">&gt; System32... УДАЛЕНО</p>
             <p className="text-red-500 text-sm mb-2 font-bold animate-pulse" style={{animationDelay: '0.5s'}}>&gt; Данные пользователя... ПОВРЕЖДЕНЫ</p>
             <p className="text-red-500 text-sm font-bold animate-pulse" style={{animationDelay: '1.0s'}}>&gt; Ядро... КРИТИЧЕСКИЙ СБОЙ</p>
          </div>
        </div>
      )}

      {/* STAGE: BIOS */}
      {stage === GameStage.BIOS && (
        <div className="fixed inset-0 z-[60] bg-[#0000AA] font-mono text-white p-8 cursor-none">
            <div className="border-b-2 border-white mb-4 pb-2 flex justify-between">
                <span>PHOENIXBIOS 4.0 RELEASE 6.0</span>
                <span>Утилита Настройки</span>
            </div>
            <div className="flex gap-8">
                <div className="w-1/3 border-r-2 border-white h-[80vh] pr-4">
                   <ul className="space-y-2">
                       <li>Main</li>
                       <li>Advanced</li>
                       <li className="bg-white text-[#0000AA] px-1">Boot (Загрузка)</li>
                       <li>Exit</li>
                   </ul>
                </div>
                <div className="flex-1">
                   <p className="mb-4">Приоритет загрузки</p>
                   <ul className="space-y-2 ml-4">
                       <li>1. Съемный диск</li>
                       <li className="cursor-pointer hover:bg-white hover:text-[#0000AA] animate-pulse" onClick={() => setStage(GameStage.OS_INSTALL)}>
                           2. USB: Установщик Windows 11 [НАЖМИТЕ ENTER]
                       </li>
                       <li>3. Жесткий диск</li>
                   </ul>
                </div>
            </div>
            <div className="fixed bottom-4 left-4 flex gap-4 text-sm opacity-70">
                <span>F1: Помощь</span>
                <span>Esc: Выход</span>
                <span>Enter: Выбрать</span>
            </div>
        </div>
      )}

      {/* STAGE: OS INSTALL */}
      {stage === GameStage.OS_INSTALL && (
        <div className="fixed inset-0 bg-[#0078D7] flex flex-col items-center justify-center font-sans z-[60]">
             <div className="bg-white p-12 rounded shadow-2xl w-full max-w-2xl text-black text-center">
                 <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
                 <h2 className="text-3xl mb-2">Установка Windows</h2>
                 <p className="text-gray-500 mb-8">Компьютер перезагрузится несколько раз. Расслабьтесь.</p>
                 <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                     <div className="bg-[#0078D7] h-full transition-all duration-300" style={{width: `${osInstallProgress}%`}}></div>
                 </div>
                 <p className="mt-4 text-4xl font-light">{Math.floor(osInstallProgress)}%</p>
             </div>
        </div>
      )}

      {/* STAGE: CLEANING */}
      {stage === GameStage.CLEANING && (
        <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center">
            <div className="relative">
                <Shield size={96} className="text-green-500 mb-8 animate-pulse relative z-10" />
                <div className="absolute inset-0 bg-green-500 blur-2xl opacity-30 animate-pulse"></div>
            </div>
            <h1 className="text-4xl text-green-500 font-mono tracking-widest">Dr.Web CureIt!</h1>
            <h2 className="text-2xl text-white mt-4 font-light">Нейтрализация угрозы: Digital Contagion</h2>
            <div className="mt-8 font-mono text-green-400 bg-black p-6 rounded border border-green-900 w-full max-w-lg">
                <div className="mb-2">&gt; Эвристический анализ... <span className="text-white">ГОТОВО</span></div>
                <div className="mb-2">&gt; Сканирование памяти... <span className="text-white">ГОТОВО</span></div>
                <div className="mb-2 animate-pulse">&gt; Убийство процесса 882... <span className="text-red-500">ВЫПОЛНЕНИЕ</span></div>
                <div className="w-full bg-green-900 h-2 mt-4 rounded">
                     <div className="bg-green-400 h-full animate-[wiggle_1s_ease-in-out_infinite]" style={{width: '80%'}}></div>
                </div>
            </div>
        </div>
      )}

      {/* STAGE: VICTORY */}
      {stage === GameStage.VICTORY && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center text-black">
            <h1 className="text-6xl font-bold mb-4 tracking-tighter">СИСТЕМА В БЕЗОПАСНОСТИ</h1>
            <p className="text-xl max-w-lg text-center font-mono">Угроза устранена. Но цифровой мир огромен, и тени в нем глубоки.</p>
            <button onClick={() => window.location.reload()} className="mt-12 bg-black text-white px-8 py-4 rounded hover:scale-105 transition-transform font-bold text-lg">
                ПЕРЕЗАГРУЗИТЬ СИСТЕМУ
            </button>
        </div>
      )}

      {/* STAGE: GAME OVER */}
      {stage === GameStage.GAME_OVER && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-red-600 font-mono">
             <Skull size={128} className="mb-8 animate-pulse" />
             <h1 className="text-8xl glitch-text font-black">ИГРА ОКОНЧЕНА</h1>
             <p className="mt-4 text-2xl tracking-[0.5em]">ТВОЯ СИСТЕМА ПРИНАДЛЕЖИТ НАМ</p>
             <button onClick={() => window.location.reload()} className="mt-12 border-2 border-red-600 px-8 py-3 hover:bg-red-600 hover:text-black transition-colors font-bold text-xl uppercase">
                ПОПРОБОВАТЬ СНОВА
            </button>
        </div>
      )}

      {/* Scanlines Overlay - Low Opacity */}
      <div className="absolute inset-0 z-[60] pointer-events-none opacity-10 crt-overlay"></div>
    </div>
  );
}