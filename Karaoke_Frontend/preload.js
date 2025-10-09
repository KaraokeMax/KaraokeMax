const { contextBridge, ipcRenderer } = require('electron');

window.electronAPI = {
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  isMaximized: () => ipcRenderer.invoke('is-maximized')
};
