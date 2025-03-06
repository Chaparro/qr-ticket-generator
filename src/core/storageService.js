import fs from 'fs/promises';
import path from 'path';
import { Ticket } from './ticket.js';

export class StorageService {
  constructor(storagePath) {
    this.storagePath = storagePath;
  }

  /**
   * Initialize storage directory
   */
  async init() {
    try {
      await fs.mkdir(this.storagePath, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to initialize storage: ${error.message}`);
    }
  }

  /**
   * Save a ticket with its QR code
   * @param {Ticket} ticket Ticket to save
   * @param {Buffer} qrCodeBuffer QR code as buffer
   * @returns {Promise<string>} Path where the QR code was saved
   */
  async saveTicket(ticket, qrCodeBuffer) {
    try {
      // Create directory for the ticket if it doesn't exist
      const ticketDir = path.join(this.storagePath, ticket.id);
      await fs.mkdir(ticketDir, { recursive: true });
      
      // Save QR code image
      const qrPath = path.join(ticketDir, 'qrcode.png');
      await fs.writeFile(qrPath, qrCodeBuffer);
      
      // Save ticket metadata
      const metadataPath = path.join(ticketDir, 'metadata.json');
      await fs.writeFile(metadataPath, JSON.stringify(ticket.toJSON(), null, 2));
      
      return qrPath;
    } catch (error) {
      throw new Error(`Failed to save ticket: ${error.message}`);
    }
  }

  /**
   * Get all saved tickets
   * @returns {Promise<Array<{ticket: Ticket, qrPath: string}>>} Array of tickets with paths
   */
  async getAllTickets() {
    try {
      const ticketDirs = await fs.readdir(this.storagePath);
      const tickets = [];
      
      for (const dir of ticketDirs) {
        const ticketDir = path.join(this.storagePath, dir);
        const stats = await fs.stat(ticketDir);
        
        if (stats.isDirectory()) {
          try {
            const metadataPath = path.join(ticketDir, 'metadata.json');
            const qrPath = path.join(ticketDir, 'qrcode.png');
            
            const metadataBuffer = await fs.readFile(metadataPath, 'utf8');
            const metadata = JSON.parse(metadataBuffer);
            
            // Recreate ticket object
            const ticket = new Ticket(
              metadata.id,
              new Date(metadata.timestamp),
              metadata.data
            );
            
            tickets.push({
              ticket,
              qrPath
            });
          } catch (err) {
            // Skip invalid ticket directories
            console.error(`Error reading ticket ${dir}:`, err);
          }
        }
      }
      
      return tickets;
    } catch (error) {
      throw new Error(`Failed to get tickets: ${error.message}`);
    }
  }

  /**
   * Delete all tickets
   * @returns {Promise<void>}
   */
  async clearAllTickets() {
    try {
      const ticketDirs = await fs.readdir(this.storagePath);
      
      for (const dir of ticketDirs) {
        const ticketDir = path.join(this.storagePath, dir);
        const stats = await fs.stat(ticketDir);
        
        if (stats.isDirectory()) {
          await fs.rm(ticketDir, { recursive: true, force: true });
        }
      }
    } catch (error) {
      throw new Error(`Failed to clear tickets: ${error.message}`);
    }
  }
}