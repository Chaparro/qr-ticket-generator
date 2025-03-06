import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Generate a new ticket
  generateTicket: (ticketData) => ipcRenderer.invoke('generate-ticket', ticketData),
  
  // Get all saved tickets
  getAllTickets: () => ipcRenderer.invoke('get-all-tickets'),
  
  // Clear all tickets
  clearAllTickets: () => ipcRenderer.invoke('clear-all-tickets')
});