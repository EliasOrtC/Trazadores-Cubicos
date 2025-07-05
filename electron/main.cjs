const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  // Crear la ventana del navegador
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    // icon: path.join(__dirname, '../public/favicon.svg'),
    title: 'Métodos Numéricos - Trazadores Cúbicos'
  });

  // Cargar la aplicación
  if (process.env.NODE_ENV === 'development') {
    // En desarrollo, esperar a que el servidor esté listo
    mainWindow.loadURL('http://localhost:4321');
  } else {
    // En producción, cargar desde el build
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Abrir las herramientas de desarrollador en desarrollo
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Manejar cuando la ventana se cierra
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Este método se llamará cuando Electron haya terminado de inicializar
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // En macOS es común recrear una ventana cuando se hace clic en el icono del dock
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Salir cuando todas las ventanas estén cerradas
app.on('window-all-closed', () => {
  // En macOS es común que las aplicaciones permanezcan activas hasta que el usuario las cierre explícitamente
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// En este archivo puedes incluir el resto del código específico del proceso principal
// También puedes ponerlos en archivos separados y requerirlos aquí. 