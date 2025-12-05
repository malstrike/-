export enum GameStage {
  BOOT_SCREEN = 'BOOT_SCREEN',
  DESKTOP_CLEAN = 'DESKTOP_CLEAN',
  BROWSER_SEARCH = 'BROWSER_SEARCH',
  BROWSER_DOWNLOAD = 'BROWSER_DOWNLOAD',
  INSTALLER = 'INSTALLER',
  FPS_GAME = 'FPS_GAME',
  GLITCH_PHASE = 'GLITCH_PHASE',
  SYSTEM_TRAP = 'SYSTEM_TRAP', // Mic/Cam demand
  WINLOCKER = 'WINLOCKER',
  BIOS = 'BIOS',
  OS_INSTALL = 'OS_INSTALL',
  DESKTOP_INFECTED = 'DESKTOP_INFECTED',
  TELEGRAM_CHAT = 'TELEGRAM_CHAT',
  ANTIVIRUS_QUEST = 'ANTIVIRUS_QUEST',
  CLEANING = 'CLEANING',
  VICTORY = 'VICTORY',
  GAME_OVER = 'GAME_OVER'
}

export interface WindowState {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  content: React.ReactNode;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
}

export interface DialogueLine {
  speaker: 'KID' | 'AI';
  text: string;
  delay: number; // ms delay before speaking
}

export enum VirusIntensity {
  NONE = 0,
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4
}