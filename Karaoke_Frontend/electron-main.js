const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: 'hidden',
    frame: false,
    resizable: true,
    minimizable: true,
    maximizable: true,
    closable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Remove o menu padrão do Electron
  win.setMenuBarVisibility(false);

  if (process.env.VITE_DEV_SERVER_URL) {
    console.log("Tentando carregar URL dev:", process.env.VITE_DEV_SERVER_URL);
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
      .then(() => console.log("Vite carregado com sucesso!"))
      .catch(err => console.error("Erro ao carregar URL dev:", err));
    // DevTools só em desenvolvimento
    win.webContents.openDevTools();
  } else {
    console.log("Carregando build de produção...");
    win.loadFile(path.join(__dirname, 'dist', 'index.html'))
      .then(() => console.log("Build carregado com sucesso!"))
      .catch(err => console.error("Erro ao carregar build:", err));
    // Em produção, garante que o menu não apareça
    win.setMenuBarVisibility(false);
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Handlers para controle da janela
ipcMain.handle('minimize-window', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.minimize();
});

ipcMain.handle('close-window', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.close();
});

ipcMain.handle('maximize-window', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
    return win.isMaximized();
  }
  return false;
});

ipcMain.handle('is-maximized', () => {
  const win = BrowserWindow.getFocusedWindow();
  return win ? win.isMaximized() : false;
});
