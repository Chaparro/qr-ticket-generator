import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { QRGenerator } from '../core/qrGenerator.js';
import { StorageService } from '../core/storageService.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global reference to prevent window from being garbage collected
let mainWindow;

// Initialize core services
const qrGenerator = new QRGenerator();
const storageService = new StorageService(
  path.join(app.getPath('userData'), 'tickets')
);

async function createWindow() {
  // Initialize storage
  await storageService.init();

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load the index.html file
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Open DevTools in development
  // mainWindow.webContents.openDevTools();

  // Window closed event
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App ready event
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});

// IPC handlers
ipcMain.handle('generate-ticket', async (event, ticketData) => {
  try {
    const ticket = qrGenerator.createTicket(ticketData);
    const qrBuffer = await qrGenerator.generateQRCodeBuffer(ticket);
    const qrDataURL = await qrGenerator.generateQRCodeDataURL(ticket);
    
    await storageService.saveTicket(ticket, qrBuffer);
    
    return {
      success: true,
      ticket: ticket.toJSON(),
      qrDataURL
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('get-all-tickets', async () => {
  try {
    const ticketsData = await storageService.getAllTickets();
    
    // Convert file paths to data URLs for rendering
    const ticketsWithDataURLs = await Promise.all(
      ticketsData.map(async ({ ticket, qrPath }) => {
        const qrDataURL = await qrGenerator.generateQRCodeDataURL(ticket);
        return {
          ticket: ticket.toJSON(),
          qrDataURL
        };
      })
    );
    
    return {
      success: true,
      tickets: ticketsWithDataURLs
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('clear-all-tickets', async () => {
  try {
    await storageService.clearAllTickets();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});