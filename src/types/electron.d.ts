// Electron type definitions for renderer process
declare global {
  interface Window {
    require?: NodeRequire;
  }
}

export {};