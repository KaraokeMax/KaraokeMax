const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    console.log("Tentando carregar URL dev:", process.env.VITE_DEV_SERVER_URL);
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
      .then(() => console.log("Vite carregado com sucesso!"))
      .catch(err => console.error("Erro ao carregar URL dev:", err));
    win.webContents.openDevTools();
  } else {
    console.log("Carregando build de produção...");
    win.loadFile(path.join(__dirname, 'dist', 'index.html'))
      .then(() => console.log("Build carregado com sucesso!"))
      .catch(err => console.error("Erro ao carregar build:", err));
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
